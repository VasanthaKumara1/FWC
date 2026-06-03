const express = require('express');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// Generate payroll
router.post('/generate', authMiddleware, roleMiddleware('admin', 'hr'), async (req, res) => {
  try {
    const { month, year } = req.body;
    
    const employees = await Employee.find({ status: 'active' });
    const payrolls = [];

    for (let employee of employees) {
      const payroll = new Payroll({
        employee: employee._id,
        month,
        year,
        basicSalary: employee.salary,
        allowances: {
          dearness: employee.salary * 0.1,
          house: employee.salary * 0.05,
          conveyance: employee.salary * 0.02
        },
        deductions: {
          tax: employee.salary * 0.15,
          insurance: employee.salary * 0.02,
          providentFund: employee.salary * 0.08
        }
      });

      // Calculate net salary
      const allowancesTotal = payroll.allowances.dearness + payroll.allowances.house + payroll.allowances.conveyance;
      const deductionsTotal = payroll.deductions.tax + payroll.deductions.insurance + payroll.deductions.providentFund;
      payroll.netSalary = payroll.basicSalary + allowancesTotal - deductionsTotal;

      await payroll.save();
      payrolls.push(payroll);
    }

    res.status(201).json({ message: 'Payroll generated successfully', count: payrolls.length });
  } catch (err) {
    res.status(500).json({ message: 'Error generating payroll', error: err.message });
  }
});

// Get payroll by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee', 'firstName lastName email salary');
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payroll', error: err.message });
  }
});

// Get payroll by employee
router.get('/employee/:employeeId', authMiddleware, async (req, res) => {
  try {
    const payroll = await Payroll.find({ employee: req.params.employeeId });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payroll', error: err.message });
  }
});

// Update payroll status
router.patch('/:id/status', authMiddleware, roleMiddleware('admin', 'hr'), async (req, res) => {
  try {
    const { status, paymentDate } = req.body;
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status, paymentDate },
      { new: true }
    );
    res.json({ message: 'Payroll status updated', payroll });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payroll', error: err.message });
  }
});

module.exports = router;
