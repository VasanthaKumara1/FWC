const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple in-memory stores for demo purposes
const employees = [
  { _id: 'e1', firstName: 'Alice', lastName: 'Doe', email: 'alice@example.com', salary: 5000, status: 'active' },
  { _id: 'e2', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', salary: 4500, status: 'active' }
];

let payrolls = [];

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Generate payroll
app.post('/payroll/generate', (req, res) => {
  const { month, year } = req.body || {};
  if (!month || !year) return res.status(400).json({ message: 'month and year required' });

  const newPayrolls = employees.filter(e => e.status === 'active').map(e => {
    const allowances = { dearness: e.salary * 0.1, house: e.salary * 0.05, conveyance: e.salary * 0.02 };
    const deductions = { tax: e.salary * 0.15, insurance: e.salary * 0.02, providentFund: e.salary * 0.08 };
    const netSalary = e.salary + allowances.dearness + allowances.house + allowances.conveyance - (deductions.tax + deductions.insurance + deductions.providentFund);
    return {
      id: `p_${Date.now()}_${e._id}`,
      employee: e,
      month,
      year,
      basicSalary: e.salary,
      allowances,
      deductions,
      netSalary,
      status: 'pending'
    };
  });
  payrolls = payrolls.concat(newPayrolls);
  res.status(201).json({ message: 'Payroll generated', count: newPayrolls.length });
});

app.get('/payroll', (req, res) => res.json(payrolls));

app.get('/payroll/:id', (req, res) => {
  const p = payrolls.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

app.get('/employees', (req, res) => res.json(employees));

app.patch('/payroll/:id/status', (req, res) => {
  const { status, paymentDate } = req.body || {};
  const p = payrolls.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  p.status = status || p.status;
  p.paymentDate = paymentDate || p.paymentDate;
  res.json({ message: 'Updated', payroll: p });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
