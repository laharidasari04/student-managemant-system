// Student Management System

class StudentManagementSystem {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.currentId = parseInt(localStorage.getItem('currentId')) || 1;
        this.isEditing = false;
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.editingStudentId = null;

        // Initialize based on current page
        this.initializePage();
    }

    initializePage() {
        switch(this.currentPage) {
            case 'index.html':
                this.initializeHome();
                break;
            case 'add-student.html':
                this.initializeAddStudent();
                break;
            case 'view-students.html':
                this.initializeViewStudents();
                break;
        }
    }

    initializeHome() {
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = this.students.length;
        }
    }

    initializeAddStudent() {
        this.form = document.getElementById('studentForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.successMessage = document.getElementById('successMessage');

        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('id');
        
        if (studentId) {
            this.loadStudentForEditing(parseInt(studentId));
        }

        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', this.resetForm.bind(this));
        }
    }

    initializeViewStudents() {
        this.studentList = document.getElementById('studentList');
        this.searchInput = document.getElementById('searchInput');
        this.noStudents = document.getElementById('noStudents');

        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        this.renderStudentList();
    }

    saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('currentId', this.currentId.toString());
    }

    loadStudentForEditing(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            this.isEditing = true;
            this.editingStudentId = studentId;
            
            // Update form fields
            document.getElementById('studentId').value = student.id;
            document.getElementById('name').value = student.name;
            document.getElementById('email').value = student.email;
            document.getElementById('phone').value = student.phone;
            document.getElementById('grade').value = student.grade;
            
            // Update UI
            this.submitBtn.textContent = 'Update Student';
            document.querySelector('h2').textContent = 'Edit Student';
            
            // Add animation class to form
            this.form.classList.add('editing');
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const studentId = document.getElementById('studentId').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const grade = document.getElementById('grade').value;

        if (this.isEditing) {
            // Update existing student
            const index = this.students.findIndex(s => s.id === parseInt(studentId));
            if (index !== -1) {
                this.students[index] = {
                    id: parseInt(studentId),
                    name,
                    email,
                    phone,
                    grade
                };
                this.showSuccessMessage('Student updated successfully!');
            }
        } else {
            // Add new student
            const newStudent = {
                id: this.currentId++,
                name,
                email,
                phone,
                grade
            };
            this.students.push(newStudent);
            this.showSuccessMessage('Student added successfully!');
        }

        this.saveToLocalStorage();
        this.resetForm();
        
        // If we're editing, redirect back to view students page
        if (this.isEditing) {
            setTimeout(() => {
                window.location.href = 'view-students.html';
            }, 1000);
        }
    }

    showSuccessMessage(message = 'Student added successfully!') {
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.style.display = 'block';
            this.successMessage.style.opacity = '1';
            setTimeout(() => {
                this.successMessage.style.opacity = '0';
                setTimeout(() => {
                    this.successMessage.style.display = 'none';
                }, 300);
            }, 2000);
        }
    }

    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (student) {
            window.location.href = `add-student.html?id=${id}`;
        }
    }

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.students = this.students.filter(student => student.id !== id);
            this.saveToLocalStorage();
            this.renderStudentList();
        }
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            document.getElementById('studentId').value = '';
            this.submitBtn.textContent = 'Add Student';
            this.isEditing = false;
            this.editingStudentId = null;
            document.querySelector('h2').textContent = 'Add New Student';
            this.form.classList.remove('editing');
        }
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        this.renderStudentList(searchTerm);
    }

    renderStudentList(searchTerm = '') {
        if (!this.studentList) return;

        let filteredStudents = this.students;
        if (searchTerm) {
            filteredStudents = this.students.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.phone.includes(searchTerm) ||
                student.grade.toString().includes(searchTerm)
            );
        }

        if (filteredStudents.length === 0) {
            if (this.noStudents) {
                this.noStudents.style.display = 'block';
            }
            this.studentList.innerHTML = '';
        } else {
            if (this.noStudents) {
                this.noStudents.style.display = 'none';
            }
            this.studentList.innerHTML = filteredStudents.map(student => `
                <tr class="student-row">
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.phone}</td>
                    <td>${student.grade}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" onclick="sms.editStudent(${student.id})">Edit</button>
                        <button class="delete-btn" onclick="sms.deleteStudent(${student.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

// Initialize the application
const sms = new StudentManagementSystem(); 