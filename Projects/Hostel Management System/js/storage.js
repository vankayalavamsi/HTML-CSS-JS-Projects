/* Hostel-Management-System/js/storage.js */
class StorageManager {
    constructor() {
        this.prefix = 'hostelms_';
    }

    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clearAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
        keys.forEach(k => localStorage.removeItem(k));
    }

    exportData() {
        const data = {};
        Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => {
            data[k] = localStorage.getItem(k);
        });
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
            return true;
        } catch (e) {
            return false;
        }
    }

    initializeSampleData() {
        if (this.get('initialized')) return;

        const firstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Krishna','Ishaan','Shaurya','Ananya','Diya','Myra','Sara','Aadhya','Riya','Priya','Kavya','Nisha','Pooja','Rahul','Amit','Rohan','Vikram','Deepak','Suresh','Mahesh','Rajesh','Kamal','Nitin','Sneha','Meera','Rucha','Pallavi','Tanvi','Neha','Swati','Divya','Anjali','Megha','Karan','Raj','Manish','Varun','Nikhil','Sanjay','Ajay','Prashant','Harsh','Yash','Ravi','Siddharth','Abhinav','Gaurav','Pankaj','Tarun','Mohan','Lalit','Sunil','Pradeep','Ashok','Ramesh','Dinesh','Subhash','Kiran','Ganesh','Murthy','Reddy','Sharma','Patel','Singh','Verma','Gupta','Kumar','Joshi','Rao','Nair','Iyer','Menon','Das','Bose','Mukherjee','Chatterjee','Banerjee','Pillai','Kulkarni','Deshmukh','Jadhav','Shinde','Patil','More','Naik','Sawant','Thakur','Chauhan','Bundela','Khanna','Malhotra','Bhatia','Sethi','Ahuja','Tandon','Chopra','Wadhwa','Gulati','Kapoor'];
        const lastNames = ['Sharma','Patel','Singh','Verma','Gupta','Kumar','Joshi','Rao','Nair','Iyer','Menon','Das','Bose','Mukherjee','Chatterjee','Banerjee','Pillai','Kulkarni','Deshmukh','Jadhav','Shinde','Patil','More','Naik','Sawant','Thakur','Chauhan','Bundela','Khanna','Malhotra','Bhatia','Sethi','Ahuja','Tandon','Chopra','Wadhwa','Gulati','Kapoor','Mehta','Shah','Parekh','Desai','Trivedi','Pandya','Soni','Bhatt','Janii','Amin','Memon','Khan','Pathan','Shaikh','Ansari','Hussain','Rizvi','Ali','Hamid','Siddiqui','Farooqi','Usmani','Ashraf','Zaidi','Rizwan','Kamal','Nayak','Swain','Mohapatra','Panda','Sahoo','Rath','Mishra','Tripathi','Upadhyay','Dubey','Pandey','Tiwari','Srivastava','Misra','Agarwal','Khandelwal','Goel','Bansal','Mittal','Oberoi','Garg','Batra','Sachdeva','Chadha','Kohli','Walia','Suri','Bhalla','Chhabra','Dhawan','Kakkar','Makhija','Chokshi','Panchal','Vora'];
        const branches = ['Computer Science','Electronics','Mechanical','Civil','Electrical','Information Technology','Chemical','Biotechnology','MBA','MCA'];
        const years = ['1st Year','2nd Year','3rd Year','4th Year'];
        const blocks = ['Block A','Block B','Block C','Block D'];
        const rooms = [];
        const students = [];
        const fees = [];
        const attendance = [];
        const complaints = [];
        const visitors = [];
        const notices = [];
        const staffList = [];

        // Generate 50 Rooms
        for (let b = 0; b < 4; b++) {
            for (let f = 1; f <= 3; f++) {
                for (let r = 1; r <= 4; r++) {
                    const roomNum = `${String.fromCharCode(65 + b)}${f}${String(r).padStart(2, '0')}`;
                    const capacity = [2, 3, 4][Math.floor(Math.random() * 3)];
                    rooms.push({
                        id: 'ROOM' + String(rooms.length + 1).padStart(3, '0'),
                        block: blocks[b],
                        floor: f,
                        number: roomNum,
                        capacity: capacity,
                        occupants: [],
                        status: Math.random() > 0.15 ? 'available' : (Math.random() > 0.5 ? 'occupied' : 'maintenance')
                    });
                }
            }
        }

        // Generate 100 Students
        for (let i = 0; i < 100; i++) {
            const fn = firstNames[i % firstNames.length];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const sid = 'STU' + String(i + 1).padStart(3, '0');
            const branch = branches[Math.floor(Math.random() * branches.length)];
            const year = years[Math.floor(Math.random() * years.length)];
            const availRooms = rooms.filter(r => r.status === 'available' && r.occupants.length < r.capacity);
            let assignedRoom = null;
            if (availRooms.length > 0 && i < 90) {
                assignedRoom = availRooms[Math.floor(Math.random() * availRooms.length)];
                assignedRoom.occupants.push(sid);
                if (assignedRoom.occupants.length >= assignedRoom.capacity) assignedRoom.status = 'occupied';
            }
            students.push({
                id: sid,
                firstName: fn,
                lastName: ln,
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}@hostel.edu`,
                phone: '9' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
                dob: `${1985 + Math.floor(Math.random() * 8)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                branch: branch,
                year: year,
                roomId: assignedRoom ? assignedRoom.id : null,
                roomNumber: assignedRoom ? assignedRoom.number : null,
                block: assignedRoom ? assignedRoom.block : null,
                address: `${Math.floor(Math.random() * 500) + 1}, Street ${Math.floor(Math.random() * 50) + 1}`,
                city: ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Jaipur','Lucknow','Ahmedabad'][Math.floor(Math.random() * 10)],
                state: ['Maharashtra','Delhi','Karnataka','Telangana','Tamil Nadu','West Bengal','Rajasthan','Uttar Pradesh','Gujarat','Kerala'][Math.floor(Math.random() * 10)],
                guardianName: `${ln} Sr.`,
                guardianPhone: '9' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
                bloodGroup: ['A+','A-','B+','B-','O+','O-','AB+','AB-'][Math.floor(Math.random() * 8)],
                photo: null,
                admissionDate: '2024-06-15',
                status: 'active'
            });
        }

        // Generate 50 Fee Records
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const feeTypes = ['Hostel Fee','Mess Fee','Electricity','Laundry','Sports'];
        for (let i = 0; i < 50; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const month = months[Math.floor(Math.random() * 12)];
            const type = feeTypes[Math.floor(Math.random() * feeTypes.length)];
            const amount = type === 'Hostel Fee' ? 5000 : type === 'Mess Fee' ? 3000 : [500, 200, 300][feeTypes.indexOf(type) - 2] || 500;
            fees.push({
                id: 'FEE' + String(i + 1).padStart(3, '0'),
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                roomNumber: student.roomNumber || 'N/A',
                type: type,
                amount: amount,
                month: month,
                year: 2024,
                dueDate: `2024-${String(months.indexOf(month) + 1).padStart(2, '0')}-10`,
                paidDate: Math.random() > 0.3 ? `2024-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}` : null,
                status: Math.random() > 0.3 ? 'paid' : 'pending',
                mode: Math.random() > 0.5 ? 'Online' : 'Cash',
                receipt: Math.random() > 0.3 ? 'RCP' + String(Math.floor(Math.random() * 9999)).padStart(4, '0') : null
            });
        }

        // Generate 100 Attendance Records
        const today = new Date();
        for (let i = 0; i < 100; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            const status = Math.random() > 0.2 ? (Math.random() > 0.1 ? 'present' : 'leave') : 'absent';
            attendance.push({
                id: 'ATT' + String(i + 1).padStart(4, '0'),
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                roomNumber: student.roomNumber || 'N/A',
                date: date.toISOString().split('T')[0],
                status: status,
                checkIn: status !== 'absent' ? `${String(Math.floor(Math.random() * 3) + 9).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
                checkOut: status !== 'absent' ? `${String(Math.floor(Math.random() * 4) + 20).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null
            });
        }

        // Generate 30 Complaints
        const compCategories = ['Electrical','Plumbing','Furniture','Cleanliness','Noise','Internet','Water','Security','Food','Other'];
        const priorities = ['Low','Medium','High','Critical'];
        const compStatuses = ['pending','in-progress','resolved','closed'];
        for (let i = 0; i < 30; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const status = compStatuses[Math.floor(Math.random() * compStatuses.length)];
            complaints.push({
                id: 'CMP' + String(i + 1).padStart(3, '0'),
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                roomNumber: student.roomNumber || 'N/A',
                category: compCategories[Math.floor(Math.random() * compCategories.length)],
                subject: `${compCategories[Math.floor(Math.random() * compCategories.length)]} issue in room ${student.roomNumber || 'unknown'}`,
                description: 'There is an ongoing issue that needs immediate attention regarding the mentioned category.',
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                status: status,
                assignedTo: staffList.length > 0 ? staffList[Math.floor(Math.random() * staffList.length)].name : 'Unassigned',
                createdAt: new Date(today.getTime() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
                resolvedAt: status === 'resolved' || status === 'closed' ? new Date(today.getTime() - Math.floor(Math.random() * 10) * 86400000).toISOString().split('T')[0] : null,
                timeline: [
                    { date: new Date(today.getTime() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0], action: 'Complaint registered', by: 'Student' },
                    ...(status !== 'pending' ? [{ date: new Date(today.getTime() - Math.floor(Math.random() * 20) * 86400000).toISOString().split('T')[0], action: 'Assigned to staff', by: 'Admin' }] : []),
                    ...(status === 'resolved' || status === 'closed' ? [{ date: new Date(today.getTime() - Math.floor(Math.random() * 5) * 86400000).toISOString().split('T')[0], action: 'Issue resolved', by: 'Staff' }] : [])
                ]
            });
        }

        // Generate 30 Visitors
        const purposes = ['Parent Visit','Friend Visit','Delivery','Maintenance','Official','Other'];
        for (let i = 0; i < 30; i++) {
            const student = students[Math.floor(Math.random() * students.length)];
            const hoursAgo = Math.floor(Math.random() * 72);
            const inTime = new Date(today.getTime() - hoursAgo * 3600000);
            visitors.push({
                id: 'VIS' + String(i + 1).padStart(3, '0'),
                name: firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)],
                phone: '9' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
                address: 'Visitor Address, City',
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                roomNumber: student.roomNumber || 'N/A',
                purpose: purposes[Math.floor(Math.random() * purposes.length)],
                inTime: inTime.toISOString(),
                outTime: hoursAgo > 2 ? new Date(inTime.getTime() + (Math.floor(Math.random() * 3) + 1) * 3600000).toISOString() : null,
                status: hoursAgo > 2 ? 'out' : 'in',
                idProof: 'Aadhar'
            });
        }

        // Generate 20 Staff
        const staffRoles = ['Warden','Security Guard','Cook','Cleaner','Electrician','Plumber','Clerk','Supervisor','Peon','Gardener'];
        const depts = ['Administration','Security','Mess','Maintenance','Housekeeping','Electrical','Plumbing','Office','General','Grounds'];
        for (let i = 0; i < 20; i++) {
            const fn = firstNames[(i + 50) % firstNames.length];
            const ln = lastNames[(i + 20) % lastNames.length];
            staffList.push({
                id: 'STF' + String(i + 1).padStart(3, '0'),
                name: `${fn} ${ln}`,
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}@hostel.edu`,
                phone: '9' + String(Math.floor(1000000000 + Math.random() * 9000000000)),
                role: staffRoles[i % staffRoles.length],
                department: depts[i % depts.length],
                salary: [15000, 12000, 10000, 8000, 14000, 13000, 11000, 9000, 7000, 7500][i % 10],
                joinDate: '2023-01-15',
                status: 'active',
                address: 'Staff Quarters, Hostel Campus'
            });
        }

        // Reassign complaints to actual staff
        complaints.forEach(c => {
            if (c.assignedTo === 'Unassigned') {
                c.assignedTo = staffList[Math.floor(Math.random() * staffList.length)].name;
            }
        });

        // Generate 20 Notices
        const noticeCategories = ['General','Academic','Maintenance','Event','Emergency','Rules'];
        for (let i = 0; i < 20; i++) {
            notices.push({
                id: 'NTC' + String(i + 1).padStart(3, '0'),
                title: ['Water Supply Maintenance','Annual Day Celebration','Fee Payment Deadline','Room Inspection','Holiday Notice','Sports Event','Cleanliness Drive','Fire Drill','Library Hours Update','Mess Menu Change','Hostel Rules Update','WiFi Maintenance','Electricity Shutdown','Health Checkup Camp','Cultural Festival','Exam Schedule','Vacation Notice','New Warden Appointment','Parking Rules','Laundry Schedule'][i],
                content: 'This is a notice regarding the above mentioned subject. All residents are requested to take note and comply accordingly. For any queries, contact the hostel office.',
                category: noticeCategories[i % noticeCategories.length],
                priority: i < 3 ? 'high' : (i < 8 ? 'medium' : 'low'),
                pinned: i < 5,
                active: true,
                createdBy: 'Admin',
                createdAt: new Date(today.getTime() - Math.floor(Math.random() * 60) * 86400000).toISOString().split('T')[0],
                expiresAt: new Date(today.getTime() + Math.floor(Math.random() * 90) * 86400000).toISOString().split('T')[0]
            });
        }

        // Set all data
        this.set('users', [
            { id: 'admin', name: 'Administrator', email: 'admin@hostel.edu', password: 'admin123', role: 'admin', avatar: null },
            { id: 'STU001', name: 'Aarav Sharma', email: 'aarav.sharma@hostel.edu', password: 'stu123', role: 'student', avatar: null }
        ]);
        this.set('students', students);
        this.set('rooms', rooms);
        this.set('fees', fees);
        this.set('attendance', attendance);
        this.set('complaints', complaints);
        this.set('visitors', visitors);
        this.set('staff', staffList);
        this.set('notices', notices);
        this.set('initialized', true);
        this.set('settings', { theme: 'light', currency: 'INR', hostelName: 'HostelMS', rowsPerPage: 10 });
    }
}

const storage = new StorageManager();
storage.initializeSampleData();