const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const { notFound, errorHandler } = require("./middlewares");

require('dotenv').config();

const schema = require('./db/schema');
const db = require('./db/connection');
const employees = db.get('employees');
const app = express();
const monk = require('monk');

// helmet middleware for security headers
app.use(helmet());
// Morgan middleware for HTTP request loggings
app.use(morgan('dev'));
// BodyPraser middleware to prase JSON request (optional with newer verions of express )
app.use(bodyParser.json());

// code API endpoints here

// get all the employees
app.get('/', async(req, res, next) => {
    try{
        const allEmployees = await employees.find({});
        res.json(allEmployees);
    } catch(error){
        next(error);
    }
});

// get a specific employee
app.get('/:id', async(req, res, next)=> {
    try{
        const { id } = req.params;
        const employee = await employees.findOne({
            _id:id
        });
        if(!employee) {
            const error = new Error("Employee Doesn't exists");
            return next(error);
        }
    res.json(employee);
    } catch(error) {
        next(error);
    }
});

// Creat a new employee
app.post('/', async(req, res, next) => {
    try{
        const { name, job } = res.body;
        const result = await schema.validateAsync({ name, job });
        const employees = await employees.findOne({
            name,
        })
        // employee already exists
        if(employee){
            res.status(409) //conflict error
            const error = new Error('Employee alreday exists')
            return next(error);
        }
        const newuser = await employees.insert({
            name,
            job,
        });
        consol.log('New Employee has been created');
        res.status(201).json(newuser);

    }catch(error){
        next(error);
    }
});

// update a specific employee
app.put('/:id', async(req, res, next) => {
     try{
        const{ id } = res.params;
        const { name, job } = req.body;
        const result = await schema.validateAsync({ name, job });
        const employees = await employees.findOne({
            _id: id
        });

        // employee does not exists
        if(!employee) {
            return next();
        }

        const updateEmployee = await employees/insert({
            _id: id,
            }, {
                $set:result},
                { upsert: ture }
        );
        res.json(updateEmployee);
     }catch(error){
        next(error);
     }
});

// Deleting a specific employee
app.delete('/:id', async(req, res, next) => {
    try{
        const { id } = res.params;
        const employee = await employees.findOne({
            _id: id
        });

        // employee does not exists '
        if(!employee){
            return next();
        }
        await employee.remove({

            _id: id
        });
        res.json({
            message: "Success"
        });

    }catch(error){
        next(error);
    }
});

app.use(notFound);
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Listening to port ${port}')
});