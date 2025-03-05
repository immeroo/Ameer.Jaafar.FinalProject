// Store students data and counters
let students = JSON.parse(localStorage.getItem('students')) || [];
let counters = JSON.parse(localStorage.getItem('counters')) || {
    software: { morning: 0, evening: 0 },
    is: { morning: 0, evening: 0 },
    cyber: { morning: 0, evening: 0 },
    networks: { morning: 0, evening: 0 },
    ai: { morning: 0, evening: 0 },
    multimedia: { morning: 0, evening: 0 }
};

// DOM Elements
const studentForm = document.getElementById('studentForm');
const newStudentForm = document.getElementById('newStudentForm');
const addStudentBtn = document.getElementById('addStudent');
const cancelFormBtn = document.getElementById('cancelForm');
const branchSelect = document.getElementById('branch');
const shiftSelect = document.getElementById('shift');
const studentsTableBody = document.getElementById('studentsTableBody');
const yearButtons = document.querySelectorAll('.year-btn');
let selectedYear = null;

// Stats Elements
const totalStudentsElement = document.getElementById('totalStudents');
const totalDueElement = document.getElementById('totalDue');
const totalPaidElement = document.getElementById('totalPaid');

// Show/Hide Form
addStudentBtn.addEventListener('click', () => {
    studentForm.classList.remove('hidden');
    newStudentForm.reset();
});

cancelFormBtn.addEventListener('click', () => {
    studentForm.classList.add('hidden');
});

// Add New Student
newStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const branch = branchSelect.value;
    const shift = shiftSelect.value;
    
    // Increment counter for the selected branch and shift
    counters[branch][shift]++;
    localStorage.setItem('counters', JSON.stringify(counters));
    
    // Generate sequential ID: branchCode-shift-number
    const branchCodes = {
        software: 'SW',
        is: 'IS',
        cyber: 'CY',
        networks: 'NT',
        ai: 'AI',
        multimedia: 'MM'
    };
    
    const shiftCode = shift === 'morning' ? 'M' : 'E';
    const sequentialId = `${branchCodes[branch]}-${shiftCode}-${String(counters[branch][shift]).padStart(3, '0')}`;
    
    const student = {
        id: `${branchCodes[branch]}-${shift.charAt(0)}-${counters[branch][shift]}`,
        name: document.getElementById('studentName').value,
        year: document.getElementById('studentYear').value,
        branch: branch,
        shift: shift,
        totalFees: parseFloat(document.getElementById('totalFees').value),
        paidAmount: parseFloat(document.getElementById('paidAmount').value),
        studentType: document.getElementById('studentType').value,
        paymentType: document.querySelector('input[name="paymentType"]:checked').value
    };

    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    updateTable();
    updateStats();
    studentForm.classList.add('hidden');
});

// Update Table
function updateTable() {
    studentsTableBody.innerHTML = '';
    const filteredStudents = students.filter(student => {
        const branchMatch = !branchSelect.value || student.branch === branchSelect.value;
        const shiftMatch = !shiftSelect.value || student.shift === shiftSelect.value;
        const yearMatch = !selectedYear || student.year === selectedYear;
        return branchMatch && shiftMatch && yearMatch;
    });

    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${getBranchName(student.branch)}</td>
            <td>${student.shift === 'morning' ? 'صباحي' : 'مسائي'}</td>
            <td>${student.year}</td>
            <td>${student.totalFees}</td>
            <td>${student.paidAmount}</td>
            <td>${student.totalFees - student.paidAmount}</td>
            <td>${student.studentType === 'regular' ? 'مركزي' : 'موازي'}</td>
            <td>${student.paymentType === 'direct' ? '✓' : ''}</td>
            <td>
                <button class="btn" onclick="editPayment('${student.id}')">تعديل</button>
                <button class="btn btn-cancel" onclick="deleteStudent('${student.id}')">حذف</button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
}

// Filter students
branchSelect.addEventListener('change', updateTable);
shiftSelect.addEventListener('change', updateTable);

// Academic Year Filter
yearButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        yearButtons.forEach(btn => btn.classList.remove('active'));
        
        if (selectedYear === button.dataset.year) {
            // If clicking the same button, clear the filter
            selectedYear = null;
        } else {
            // Add active class to clicked button and update selected year
            button.classList.add('active');
            selectedYear = button.dataset.year;
        }
        
        updateTable();
    });
});

// Update table with filtered students
const searchInput = document.getElementById('searchStudent');

searchInput.addEventListener('input', updateTable);

function updateTable() {
    const branch = branchSelect.value;
    const shift = shiftSelect.value;
    const searchQuery = searchInput.value.toLowerCase();
    
    let filteredStudents = students;
    if (branch) {
        filteredStudents = filteredStudents.filter(s => s.branch === branch);
    }
    if (shift) {
        filteredStudents = filteredStudents.filter(s => s.shift === shift);
    }
    if (searchQuery) {
        filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(searchQuery));
    }
    if (selectedYear) {
        filteredStudents = filteredStudents.filter(s => s.year === selectedYear);
    }

    studentsTableBody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${getBranchName(student.branch)}</td>
            <td>${getShiftName(student.shift)}</td>
            <td>${student.year}</td>
            <td>${student.totalFees}</td>
            <td>${student.paidAmount}</td>
            <td>${student.totalFees - student.paidAmount}</td>
            <td>${student.studentType === 'parallel' ? 'موازي' : 'مركزي'}</td>
            <td>${student.paymentType === 'direct' ? '✓' : ''}</td>
            <td>
                <button class="btn" onclick="editPayment('${student.id}')">تعديل الدفع</button>
                <button class="btn btn-cancel" onclick="deleteStudent('${student.id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    // Update student counts for each branch and shift
    const branches = ['software', 'is', 'cyber', 'networks', 'ai', 'multimedia'];
    
    branches.forEach(branch => {
        const morningCount = students.filter(s => s.branch === branch && s.shift === 'morning').length;
        const eveningCount = students.filter(s => s.branch === branch && s.shift === 'evening').length;
        
        document.getElementById(`${branch}StudentsMorning`).textContent = morningCount;
        document.getElementById(`${branch}StudentsEvening`).textContent = eveningCount;
    });
}

// Edit student payment
function editPayment(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const modalHtml = `
        <div class="payment-modal">
            <div class="payment-modal-content">
                <h3>تعديل معلومات الطالب</h3>
                <div class="payment-input">
                    <input type="text" id="editStudentName" value="${student.name}" placeholder="اسم الطالب" required>
                    <select id="editBranch" class="select-input" required>
                        <option value="software" ${student.branch === 'software' ? 'selected' : ''}>برمجيات</option>
                        <option value="is" ${student.branch === 'is' ? 'selected' : ''}>نظم المعلومات</option>
                        <option value="cyber" ${student.branch === 'cyber' ? 'selected' : ''}>الأمن السيبراني</option>
                        <option value="networks" ${student.branch === 'networks' ? 'selected' : ''}>الشبكات</option>
                        <option value="ai" ${student.branch === 'ai' ? 'selected' : ''}>الذكاء الاصطناعي</option>
                        <option value="multimedia" ${student.branch === 'multimedia' ? 'selected' : ''}>وسائط متعددة</option>
                    </select>
                    <select id="editShift" class="select-input" required>
                        <option value="morning" ${student.shift === 'morning' ? 'selected' : ''}>صباحي</option>
                        <option value="evening" ${student.shift === 'evening' ? 'selected' : ''}>مسائي</option>
                    </select>
                    <input type="number" id="editTotalFees" value="${student.totalFees}" placeholder="المبلغ الكلي" required>
                    <input type="number" id="editPaidAmount" value="${student.paidAmount}" placeholder="المبلغ المدفوع" required>
                    <select id="editStudentType" class="select-input" required>
                        <option value="regular" ${student.studentType === 'regular' ? 'selected' : ''}>مركزي</option>
                        <option value="parallel" ${student.studentType === 'parallel' ? 'selected' : ''}>موازي</option>
                    </select>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="editPaymentType" id="editPaymentType" value="direct" ${student.paymentType === 'direct' ? 'checked' : ''} required>
                            <span class="radio-text">✓</span>
                        </label>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="btn" onclick="savePayment('${student.id}')">حفظ</button>
                    <button class="btn btn-cancel" onclick="closePaymentModal()">إلغاء</button>
                </div>
            </div>
        </div>
    `;


    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function savePayment(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newName = document.getElementById('editStudentName').value;
    const newBranch = document.getElementById('editBranch').value;
    const newShift = document.getElementById('editShift').value;
    const newTotalFees = parseFloat(document.getElementById('editTotalFees').value);
    const newPaidAmount = parseFloat(document.getElementById('editPaidAmount').value);
    const newStudentType = document.getElementById('editStudentType').value;
    const newPaymentType = document.getElementById('editPaymentType').value;

    if (!newName || !newBranch || !newShift) {
        alert('الرجاء إدخال جميع المعلومات المطلوبة');
        return;
    }

    if (isNaN(newTotalFees) || newTotalFees < 0 || isNaN(newPaidAmount) || newPaidAmount < 0) {
        alert('الرجاء إدخال مبالغ صحيحة');
        return;
    }

    if (newPaidAmount > newTotalFees) {
        alert('المبلغ المدفوع لا يمكن أن يكون أكبر من المبلغ الكلي');
        return;
    }

    student.name = newName;
    student.branch = newBranch;
    student.shift = newShift;
    student.totalFees = newTotalFees;
    student.paidAmount = newPaidAmount;
    student.studentType = newStudentType;
    student.paymentType = newPaymentType;

    saveStudents();
    updateTable();
    updateStats();
    closePaymentModal();
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Delete student
function deleteStudent(studentId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;

    students = students.filter(s => s.id !== studentId);
    saveStudents();
    updateTable();
    updateStats();
}

// Save students to localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Helper functions for translation
function getBranchName(branch) {
    const branches = {
        'software': 'برمجيات',
        'is': 'نظم المعلومات',
        'cyber': 'الأمن السيبراني',
        'networks': 'الشبكات',
        'ai': 'الذكاء الاصطناعي',
        'multimedia': 'وسائط متعددة'
    };
    return branches[branch] || branch;
}

function getShiftName(shift) {
    const shifts = {
        'morning': 'صباحي',
        'evening': 'مسائي'
    };
    return shifts[shift] || shift;
}

// Initial render
updateTable();
updateStats();