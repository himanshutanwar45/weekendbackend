
const express = require('express');
const router = express.Router();
const Weekend = require('../../models/Weekend/WSupport')
const PendingEmployee = require('../../models/Weekend/PendingEmployee')
const { body, validationResult } = require('express-validator')
const fetchuser = require('../../middleware/fetchuser')
const User = require('../../models/Users/CreateUser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')

//Route 1:  Add Weekend Support Entry :::::POST /api/weekend/addentry
router.post('/addweekend', [
    body('empCode', 'Emter Employee Code').notEmpty(),
    body('empName', 'Enter Employee Name').notEmpty(),
    body('date', 'Enter Your Weekend Support Date').notEmpty()
], fetchuser, async (req, res) => {
    let success = false;
    const result = validationResult(req)

    if (!result.isEmpty()) {
        return res.status(400).json({ success, error: result.array() })
    }

    const { empCode, empName, date, monthYear } = req.body

    // const currentDate = new Date()
    // const currentMonth = currentDate.getMonth() + 1;
    // const currentYear = currentDate.getFullYear();
    // const formattedMonth = ('0' + currentMonth).slice(-2);
    // const monthandYear = `${formattedMonth}-${currentYear}`

    try {

        const query = {
            empCode: empCode,
            monthYear: monthYear
        }

        const findWeekend = await Weekend.find(query)

        if (findWeekend.length > 0) {

            const empcodeComp = findWeekend[0].empCode;
            const monthandyearComp = findWeekend[0].monthYear;

            const isEmpCodeMatch = empCode === empcodeComp;
            const isMonthYearMatch = monthYear === monthandyearComp;

            if (isEmpCodeMatch && isMonthYearMatch) {
                return res.status(401).json({ success: false, error: "Already worked on weekend" });
            }

        }
        const weekend = new Weekend({
            empCode, empName, date, monthYear
        })

        const weekends = await weekend.save()

        res.json({ success: true, "weekend": weekends })

    } catch (error) {
        res.status(500).send(error)
    }
})


//Route 2:  Worked Employee whose come in current month  :::::GET /api/weekend/workedemployee
router.post('/workedemployee', async (req, res) => {

    const { monthYear } = req.body

    const query = {
        monthYear: monthYear
    }

    const workedEmployee = await Weekend.find(query)

    res.json(workedEmployee)
})


//Route 3:  Pending Employee who did not come in current month  :::::POST /api/weekend/creatependingweekendentry
router.post('/creatependingweekendentry', fetchuser, async (req, res) => {
    // const { monthYear } = req.body

    // let [year, month] = monthYear.split('-').map(Number);
    // let firstDayOfMonth = new Date(year, month, 1);

    // const currentMonth = firstDayOfMonth.getMonth();
    // const formattedMonth = ('0' + currentMonth).slice(-2);
    // const numDaysInMonth = new Date(year, month, 0).getDate();
    // const weekendSupport = [];
    // let success = false;

    // const query = {
    //     monthYear: monthYear
    // }

    // const previousMonth = month - 1
    // const formattedPreviousMonth = ('0' + previousMonth).slice(-2);
    // const previousYear = year
    // const previousMonthYear = previousYear + '-' + formattedPreviousMonth

    // const previousMonthQuery = {
    //     monthYear: previousMonthYear
    // }

    // console.log(previousMonthQuery)

    // const currentUser = req.user.id

    // const allUsers = await User.find({ empCode: { $ne: "admin" } });

    // const alluserIds = allUsers.map((docs) => docs.empCode)

    // const weekendSupportEntry = await Weekend.find(query)

    // const weekendEmpCode = weekendSupportEntry.map((docs) => docs.empCode)

    // const pendingEmployeeCodes = alluserIds.filter((empcode) => !weekendEmpCode.includes(empcode))

    // const pendingEmployees = await User.find(
    //     {
    //         empCode: { $in: pendingEmployeeCodes },
    //     },
    //     { password: 0, createdDate: 0, isAdmin: 0 }
    // );

    // for (let day = 2; day <= (numDaysInMonth); day++) {
    //     const date = new Date(year, currentMonth - 1, day);

    //     const dayOfTheWeek = date.getDay();
    //     //console.log('Date',date)
    //     if (dayOfTheWeek === 0 || dayOfTheWeek === 1) {
    //         weekendSupport.push({
    //             monthYear: `${year}-${formattedMonth}`,
    //             empCode: null,
    //             date: date,
    //             empName: null,
    //             status: 'Pending',
    //             createdBy: currentUser,
    //             updatedBy: currentUser

    //         });
    //     }
    // }

    // for (let i = 0; i < weekendSupport.length; i++) {
    //     const weekendSupportEmpCode = weekendSupport[i].empCode;
    //     if (!weekendSupportEmpCode) {
    //         weekendSupport[i].empCode = pendingEmployees[i % pendingEmployees.length].empCode

    //     }
    //     const weekendSupportEmpName = weekendSupport[i].empName;
    //     if (!weekendSupportEmpName) {
    //         weekendSupport[i].empName = pendingEmployees[i % pendingEmployees.length].empName
    //     }
    // }
    // if (pendingEmployeeData) {
    //     return res.status(200).json({ success, error: `Already generated of this month` })
    // }
    // await PendingEmployee.insertMany(weekendSupport);

    // res.send({ success: true, error: `Pending employee of the this month` })

    //res.send(weekendSupport)



    const { monthYear } = req.body

    let [year, month] = monthYear.split('-').map(Number);
    let firstDayOfMonth = new Date(year, month, 1);

    const currentMonth = firstDayOfMonth.getMonth();
    const formattedMonth = ('0' + currentMonth).slice(-2);
    const numDaysInMonth = new Date(year, month, 0).getDate();
    const weekendSupport = [];
    const restUserWeekendSupport = []
    let success = false;

    const query = {
        monthYear: monthYear
    }

    const previousMonth = month - 1
    const formattedPreviousMonth = ('0' + previousMonth).slice(-2);
    const previousYear = year
    const previousMonthYear = previousYear + '-' + formattedPreviousMonth

    const previousMonthQuery = {
        monthYear: previousMonthYear
    }

    const currentUser = req.user.id

    const PreviousWeekendSupport = await Weekend.find(previousMonthQuery)

    const CurrentWeekendSupport = await Weekend.find(query)

    const CurrentPendingEmployee = await PendingEmployee.find(query)

    if (CurrentWeekendSupport.length!==0){
        return res.status(200).json({success, error: `Employee already worked of ${year}-${formattedMonth} month`})
    }

    if (CurrentWeekendSupport.length === 0) {

        const PreviousWeekendSupportEmpCode = PreviousWeekendSupport.map((docs) => docs.empCode)

        const allUsers = await User.find({ 
            empCode: { 
                $ne: "admin", 
                $nin: ["IPL035"] 
            } 
        });

        const alluserIds = allUsers.map((docs) => docs.empCode)

        const pendingEmployeeCodes = alluserIds.filter((empcode) => !PreviousWeekendSupportEmpCode.includes(empcode))

        weekendSupport.push(pendingEmployeeCodes)

        const WeekendSupportEmpCode = alluserIds.filter((empcode) => !weekendSupport.includes(empcode))

        const WeekendSupportAll = await User.find(
            {
                empCode: { $in: WeekendSupportEmpCode },
            },
            { password: 0, createdDate: 0, isAdmin: 0 }
        );

        for (let day = 1; day <= numDaysInMonth; day++) {
            const date = new Date(year, (currentMonth) - 1,(day) +1);
            const dayOfTheWeek = date.getDay();
            if (dayOfTheWeek === 0 || dayOfTheWeek === 1) {
                restUserWeekendSupport.push({
                    monthYear: `${year}-${formattedMonth}`,
                    empCode: null,
                    date: date,
                    empName: null,
                    status: 'Pending',
                    createdBy: currentUser,
                    updatedBy: currentUser

                });
            }
        }

        for (let i = 0; i < restUserWeekendSupport.length; i++) {
            const weekendSupportEmpCode = restUserWeekendSupport[i].empCode;
            if (!weekendSupportEmpCode) {
                restUserWeekendSupport[i].empCode = WeekendSupportAll[i % WeekendSupportAll.length].empCode

            }
            const weekendSupportEmpName = restUserWeekendSupport[i].empName;
            if (!weekendSupportEmpName) {
                restUserWeekendSupport[i].empName = WeekendSupportAll[i % WeekendSupportAll.length].empName
            }
        }

       
    }

    if (CurrentPendingEmployee.length!==0) {
        return res.status(200).json({ success, error: `Already generated of ${year}-${formattedMonth} month` })
    }

    await PendingEmployee.insertMany(restUserWeekendSupport);

    res.send({ success: true, error: `Pending employee of the ${year}-${formattedMonth} month` })
    //res.send(restUserWeekendSupport)

})


//Route 4:  Pending Employee who did not come in current month  :::::POST /api/weekend/pendingemployee
router.post('/pendingemployee', async (req, res) => {

    // const { monthYear } = req.body

    // const query = {
    //     monthYear: monthYear
    // }

    // const allUsers = await User.find()

    // const alluserIds = allUsers.map((docs) => docs.empCode)

    // const weekendSupport = await Weekend.find(query)

    // const weekendEmpCode = weekendSupport.map((docs) => docs.empCode)

    // const pendingEmployeeCodes = alluserIds.filter((empcode) => !weekendEmpCode.includes(empcode))

    // const pendingEmployees = await User.find({
    //     empCode: { $in: pendingEmployeeCodes },
    // });

    // // Send the list of pending employees in response
    // res.send(pendingEmployees);


    const { monthYear } = req.body

    const query = {
        monthYear: monthYear
    }

    const pendingEmployee = await PendingEmployee.find(query).sort({date:1})

    res.send(pendingEmployee)
})


//Route 5: Update your weekend entry :::::::::::PUT /api/weekend/updateentry

router.put('/updateentry/:id', fetchuser, async (req, res) => {

    let success = false
    try {
        const { empCode, empName, date } = req.body

        const newEntry = {}
        let currentDate = new Date();
        const currentUser = req.user.id

        if (empCode) { newEntry.empCode = empCode }
        if (empName) { newEntry.empName = empName }
        if (date) { newEntry.date = date }

        newEntry.updatedBy = currentUser
        newEntry.updatedDate = currentDate

        let entry = await PendingEmployee.findById(req.params.id)

        if (!entry) {
            return res.status(404).json({ success, error: "No Entry found" });
        }

        const emp_Code = await User.findOne({empCode})

        if(!emp_Code){
            return res.status(200).json({ success, error: "Employee Code doesn't exists" });
        }

        const emp_Name = await User.findOne({empName})

        if(!emp_Name){
            return res.status(200).json({ success, error: "Employee Name doesn't exists" });
        }
        
        const check_date = new Date(date)
        const dayOfTheWeek = check_date.getDay();

        if (dayOfTheWeek !== 0 && dayOfTheWeek !== 6 ){
            return res.status(200).json({ success, error: "Apply only saturday and sunday" })
        }

        entry = await PendingEmployee.findByIdAndUpdate(req.params.id, { $set: newEntry }, { new: true })

        res.send({success:true,error:"Operation Sucessfully"})

    } catch (error) {
        res.status(500).json({ error: `Contact Admin ${error.message}` });
    }
})


//Route 5:  Add Weekend Support Entry :::::POST /api/weekend/addAutoEntry
router.post('/addAutoEntry', async (req, res) => {

    let success = false

    try {

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const formattedMonth = ('0' + currentMonth).slice(-2);
        const dayOfMonth = ('0' + currentDate.getDate()).slice(-2)
        const monthandYear = `${currentYear}-${formattedMonth}-${dayOfMonth}`

        const findPendingEntry = await PendingEmployee.findOne({ "date": monthandYear })

        if (findPendingEntry) {

            const findWeekendEntry = await Weekend.findOne({ "date": monthandYear });

            if (findWeekendEntry) {
                return res.status(404).json({ success, error: `Entry already exists ${monthandYear}` });
            }

            else {
                try {
                    const weekendEntry = {
                        empCode: findPendingEntry.empCode,
                        empName: findPendingEntry.empName,
                        date: findPendingEntry.date,
                        monthYear: findPendingEntry.monthYear,
                        createdBy: "System Generated",
                        updatedBy: "System Generated"
                    };
                    await Weekend.insertMany(weekendEntry);

                    await PendingEmployee.findOneAndDelete({ "date": monthandYear })

                    return res.status(200).json({ success: true, message: `Operation Successful` });
                    //res.send(weekendEntry)
                } catch (error) {
                    return res.status(500).json({ success: false, error: `Error occurred while inserting weekend entry: ${error.message}` });
                }
            }

        }
        else {
            return res.status(404).json({ success, error: `No entry found for ${monthandYear} in pending employee list` });
        }

    } catch (error) {
        res.send(500).json({ error: `Contact Admin ${error.message}` })
    }
})


//Route 6: Send Email to the user :::::POST /api/weekend/sendmail
router.post('/sendmail', fetchuser, async (req, res) => {
    try {
        const { monthYear } = req.body;

        const query = {
            monthYear: monthYear
        };

        const currentUser = req.user.id

        const userDetails = await User.findById(currentUser)

        const employeeName = await userDetails.empName

        const email = await userDetails.email
        const password = await userDetails.password

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: "kftoohahkloyoxqr"
            }
        });

        const mailOptions = {
            from: email, // sender address
            to: "himanshutanwar45@gmail.com", // list of receivers
            subject: "Weekend Support", // Subject line
            html: "<html>" // HTML body
        };

        const pendingEmployees = await PendingEmployee.find(query);

        // Convert JSON data to HTML table

        let tableHtml = "<table border='1' width='100%'><tr> <th>Employee Code</th> <th>Employee Name</th ><th>Days</th> <th>Date</th> </tr>";
        pendingEmployees.forEach(employee => {
            let date = new Date(employee.date)

            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = dayNames[date.getDay()];

            const formattedDate = `${day}/${month}/${year}`;
            tableHtml += `<tr style="text-align:center;"><td>${employee.empCode}</td><td>${employee.empName}</td><td>${dayName}</td><td>${formattedDate}</td></tr>`;
        });
        tableHtml += "</table>";

        tableHtml += `<footer>Regards,</footer><footer>${employeeName} </footer>`

        // Append table to the email body
        mailOptions.html += tableHtml;

        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.error('Error occurred:', error.message);
        //         return res.status(500).send('Error occurred while sending email');
        //     }
        //     console.log('Email sent:', info.response);
        //     res.status(200).send('Email sent successfully');
        // });

        res.send(mailOptions.html)
    } catch (error) {
        res.status(500).json({ error: `Contact Admin ${error.message}` });
    }
});


//Route 7: Worked employee with in date range :::::POST /api/weekend/workedemployeedate
router.post('/workedemployeedate', fetchuser, async (req, res) => {
    let success = false;
    try {
        const { dateFrom, dateTo } = req.body

        const workedEmployee = await Weekend.find({
            date: {
                $gte: new Date(dateFrom), // Greater than or equal to dateFrom
                $lte: new Date(dateTo)    // Less than or equal to dateTo
            }
        }).sort({ date: 1 })

        res.status(200).json(workedEmployee)

    } catch (error) {
        res.status(500).json({ success, error: `Contact Admin ${error.message}` });
    }
})




module.exports = router;