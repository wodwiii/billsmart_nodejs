const mongoose = require('mongoose');

const waterReadingSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now },
});

const waterBillSchema = new mongoose.Schema({
  owner: String,
  periodStart: { type: Date, default: setPeriodStart },
  periodEnd: { type: Date, default: setPeriodEnd },
  readings: [waterReadingSchema],
}, { toJSON: { virtuals: true } });

waterBillSchema.virtual('total').get(function() {
  return this.readings.reduce((total, reading) => total + reading.value, 0);
});

function setPeriodStart() {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 15);
  return periodStart;
}

function setPeriodEnd() {
  const today = new Date();
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 14);
  return periodEnd;
}

module.exports = mongoose.models.WaterBill || mongoose.model('WaterBill', waterBillSchema);
