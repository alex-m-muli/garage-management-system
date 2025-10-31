// backend/utils/syncCustomerFromJobcard.js
const Customer = require('../models/Customer');

/**
 * Syncs customer data from a given job card.
 * Updates an existing customer or creates a new one.
 */
const syncCustomerFromJobCard = async (jobCard) => {
  try {
    const { name, phone, make, model, regNo, repairs, date, total } = jobCard;

    const serviceEntry = {
      date,
      description: repairs,
      cost: total || 0
    };

    // Find existing customer by name and phone
    let customer = await Customer.findOne({ name, phone });

    if (!customer) {
      // New customer
      customer = new Customer({
        name,
        phone,
        vehicles: [
          {
            make,
            model,
            regNo,
            serviceHistory: [serviceEntry]
          }
        ]
      });
    } else {
      // Find vehicle by regNo
      const existingVehicle = customer.vehicles.find(v => v.regNo === regNo);

      if (existingVehicle) {
        existingVehicle.serviceHistory.push(serviceEntry);
      } else {
        customer.vehicles.push({
          make,
          model,
          regNo,
          serviceHistory: [serviceEntry]
        });
      }
    }

    await customer.save();
  } catch (err) {
    console.error('Customer sync failed:', err.message);
  }
};

module.exports = syncCustomerFromJobCard;
