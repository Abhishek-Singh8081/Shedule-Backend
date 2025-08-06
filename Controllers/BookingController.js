const Booking = require("../Models/Booking");
const User = require("../Models/User");
const Service = require("../Models/Services");

// Helper function to round time to next multiple of 5
function roundToNext5(date) {
  const result = new Date(date);
  const minutes = result.getMinutes();
  const remainder = minutes % 5;
  if (remainder !== 0) {
    result.setMinutes(minutes + (5 - remainder));
  }
  result.setSeconds(0, 0);
  return result;
}

// Helper function to check exact overlap
function doesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

const getAvailableSlots = async (req, res) => {
  try {
    const { barberId, serviceId, date } = req.body;

    if (!barberId || !serviceId || !date) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const bookingDate = new Date(date);
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found." });
    const serviceDuration = service.duration;

    const barber = await User.findById(barberId);
    if (!barber || barber.accountType !== "Barber") {
      return res.status(404).json({ message: "Barber not found." });
    }

    const weekday = bookingDate.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const workingDay = barber.workingHours[weekday];
    if (!workingDay || !workingDay.available) {
      return res.status(200).json({ slots: [], bookedSlots: [] });
    }

    // Set up working hours
    const [startHour, startMinute] = workingDay.start.split(":").map(Number);
    const [endHour, endMinute] = workingDay.end.split(":").map(Number);

    const workStart = new Date(bookingDate);
    workStart.setHours(startHour, startMinute, 0, 0);

    const workEnd = new Date(bookingDate);
    workEnd.setHours(endHour, endMinute, 0, 0);

    // Initialize first slot start time
    let slotStartTime;
    if (isToday) {
      const minStart = new Date(now.getTime() + 10 * 60000);
      slotStartTime = new Date(bookingDate);
      slotStartTime.setHours(minStart.getHours(), minStart.getMinutes(), 0, 0);
    } else {
      slotStartTime = new Date(workStart);
    }

    // Round slotStartTime to nearest 5-minute mark
    slotStartTime = roundToNext5(slotStartTime);

    // Fetch all current bookings for that date
    const bookings = await Booking.find({
      barber: barberId,
      bookingDate: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lte: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      bookingStatus: { $in: ["Pending", "Confirmed"] }
    });

    // Convert booked slots to real Date objects for strict overlap check
    const bookedSlots = bookings.map(b => {
      const [startH, startM] = b.slot.startTime.split(":").map(Number);
      const [endH, endM] = b.slot.endTime.split(":").map(Number);

      const bsStart = new Date(bookingDate);
      bsStart.setHours(startH, startM, 0, 0);

      const bsEnd = new Date(bookingDate);
      bsEnd.setHours(endH, endM, 0, 0);

      return { start: bsStart, end: bsEnd };
    });

    // Build available slots
    const availableSlots = [];
    const step = 5 * 60000; // 5 minutes

    while (slotStartTime.getTime() + serviceDuration * 60000 <= workEnd.getTime()) {
      const slotEndTime = new Date(slotStartTime.getTime() + serviceDuration * 60000);

      // Check for overlaps with all booked slots
      const isOverlapping = bookedSlots.some(bs =>
        doesOverlap(slotStartTime, slotEndTime, bs.start, bs.end)
      );

      if (!isOverlapping) {
        const formattedStart = slotStartTime.toTimeString().slice(0, 5);
        const formattedEnd = slotEndTime.toTimeString().slice(0, 5);
        availableSlots.push({
          startTime: formattedStart,
          endTime: formattedEnd
        });
      }

      slotStartTime = new Date(slotStartTime.getTime() + step);
    }

    return res.status(200).json({
      slots: availableSlots,
      bookedSlots: bookedSlots.map(bs => ({
        startTime: bs.start.toTimeString().slice(0, 5),
        endTime: bs.end.toTimeString().slice(0, 5)
      }))
    });

  } catch (error) {
    console.error("Error in getAvailableSlots:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



const bookappointment = async (req, res) => {
  try {
    const {
      userId,
      barberId,
      saloonId,
      serviceId,
      categoryId,
      bookingDate,
      slot,
      discountPrice = 0,
      totalPrice,
     
      notes = "",
      paymentMethod = "COD"
    } = req.body;

    
    if (
      !userId ||
      !barberId ||
      !saloonId ||
      !serviceId ||
      !categoryId ||
      !bookingDate ||
      !slot?.startTime ||
      !slot?.endTime ||
      !totalPrice 
      
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      barber: barberId,
      bookingDate: new Date(bookingDate),
      bookingStatus: { $in: ["Pending", "Confirmed"] },
      $or: [
        {
          "slot.startTime": { $lt: slot.endTime },
          "slot.endTime": { $gt: slot.startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Selected time slot is already booked." });
    }

    
    const newBooking = new Booking({
      user: userId,
      barber: barberId,
      saloon: saloonId,
      category: categoryId,
      service: serviceId,
      bookingDate: new Date(bookingDate),
      slot: {
        startTime: slot.startTime,
        endTime: slot.endTime
      },
      discountPrice,
      totalPrice,
      
      paymentMethod,
      notes
    });

    const savedBooking = await newBooking.save();

    return res.status(201).json({
      message: "Appointment booked successfully.",
      booking: savedBooking
    });
  } catch (error) {
    console.error("Error in booking appointment", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};


module.exports = {
  getAvailableSlots,
  bookappointment
};
