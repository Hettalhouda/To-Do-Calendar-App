// عناصر الواجهة
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const selectedDateDisplay = document.getElementById("selectedDate");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const monthIconText = document.getElementById("month-icon-text");

// بيانات المهام
let tasks = {};
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// أسماء الشهور المختصرة للأيقونة
const monthShortNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// وظيفة لتحديث نص الشهر في الأيقونة
function updateMonthIcon() {
   monthIconText.textContent = monthShortNames[currentMonth];
}

// وظيفة لتحميل المهام من localStorage
function loadTasksFromLocalStorage() {
   try {
       const storedTasks = localStorage.getItem("todoCalendarTasks");
       if (storedTasks) {
           tasks = JSON.parse(storedTasks);
           console.log("تم تحميل المهام من localStorage:", tasks);
       } else {
           console.log("لا توجد مهام محفوظة في localStorage");
           tasks = {};
       }
   } catch (error) {
       console.error("خطأ في تحميل المهام من localStorage:", error);
       tasks = {};
   }
}

// وظيفة لحفظ المهام في localStorage
function saveTasksToLocalStorage() {
   try {
       localStorage.setItem("todoCalendarTasks", JSON.stringify(tasks));
       console.log("تم حفظ المهام في localStorage:", tasks);
   } catch (error) {
       console.error("خطأ في حفظ المهام في localStorage:", error);
   }
}

// تحويل التاريخ إلى نص
function formatDateToString(dateObj) {
   const yyyy = dateObj.getFullYear();
   const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
   const dd = String(dateObj.getDate()).padStart(2, '0');
   return `${yyyy}-${mm}-${dd}`;
}

// تعيين التاريخ المختار
function setSelectedDate(dateObj) {
   const dateStr = formatDateToString(dateObj);
   selectedDate = dateStr;
   selectedDateDisplay.textContent = dateStr;
   displayTasksForDate(dateStr);

   const allDays = document.querySelectorAll("#calendar-days .day-number");
   allDays.forEach(day => day.classList.remove("selected"));
   const selectedDayElement = document.querySelector(`[data-date="${dateStr}"]`);
   if (selectedDayElement) {
       selectedDayElement.classList.add("selected");
   }
}

// عرض المهام
function displayTasksForDate(dateStr) {
   taskList.innerHTML = "";
   const tasksForDate = tasks[dateStr] || [];

   if (tasksForDate.length === 0) {
       // إذا لم توجد مهام، عرض رسالة
       const noTasksMessage = document.createElement("li");
       noTasksMessage.className = "no-tasks-message";
       noTasksMessage.textContent = "no tasks for this date";
       taskList.appendChild(noTasksMessage);
   } else {
       // عرض المهام الموجودة
       tasksForDate.forEach((task, index) => {
           const li = document.createElement("li");
           li.className = "task-item";
           
           // إضافة محتوى المهمة
           const taskContent = document.createElement("span");
           taskContent.className = "task-content";
           taskContent.textContent = task;
           
           // إضافة حاوية الأزرار
           const buttonsContainer = document.createElement("div");
           buttonsContainer.className = "task-buttons";
           
           // إضافة زر التعديل
           const editBtn = document.createElement("button");
           editBtn.innerHTML = "<i class='bx bxs-edit-alt'></i>";
           editBtn.className = "edit-btn";
           editBtn.onclick = () => editTask(dateStr, index);
           editBtn.title = "تعديل المهمة";
           
           // إضافة زر حذف
           const deleteBtn = document.createElement("button");
           deleteBtn.innerHTML = "<i class='bx bxs-trash'></i>";
           deleteBtn.className = "delete-btn";
           deleteBtn.onclick = () => deleteTask(dateStr, index);
           deleteBtn.title = "حذف المهمة";
           
           buttonsContainer.appendChild(editBtn);
           buttonsContainer.appendChild(deleteBtn);
           
           li.appendChild(taskContent);
           li.appendChild(buttonsContainer);
           taskList.appendChild(li);
       });
   }
}

// وظيفة لتعديل مهمة
function editTask(dateStr, index) {
const currentTask = tasks[dateStr][index];

Swal.fire({
   title: ' modify the task',
   input: 'text',
   inputLabel: 'write the new modification  ',
   inputValue: currentTask,
   showCancelButton: true,
   confirmButtonText: 'Save',
   cancelButtonText: 'Cancel',
   inputValidator: (value) => {
       if (!value.trim()) {
           return 'The task cannot be empty !';
       }
   }
}).then((result) => {
   if (result.isConfirmed) {
       tasks[dateStr][index] = result.value.trim();
       saveTasksToLocalStorage();
       displayTasksForDate(dateStr);

       // إشعار بالنجاح
       Swal.fire({
           icon: 'success',
           title: 'Modified successfully  !',
           showConfirmButton: false,
           timer: 1200
       });
   }
});
}

// وظيفة لحذف مهمة
function deleteTask(dateStr, index) {
Swal.fire({
   title: ' Are you sure? ',
   text: 'This task will be deleted permanently !',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonColor: '#d33',
   cancelButtonColor: '#3085d6',
   confirmButtonText: 'Yes, delete it',
   cancelButtonText: 'Cancel'
}).then((result) => {
   if (result.isConfirmed) {
       tasks[dateStr].splice(index, 1);
       if (tasks[dateStr].length === 0) {
           delete tasks[dateStr];
       }
       saveTasksToLocalStorage();
       displayTasksForDate(dateStr);
       renderCalendar();

       // رسالة نجاح بعد الحذف
       Swal.fire(
           'Deleted !',
           'The task has been deleted !.',
           'success'
       );
   }
});
}

// إضافة مهمة
function addTask() {
   const taskText = taskInput.value.trim();
   if (taskText === "" || !selectedDate) return;

   if (!tasks[selectedDate]) {
       tasks[selectedDate] = [];
   }

   tasks[selectedDate].push(taskText);
   saveTasksToLocalStorage(); // حفظ بعد الإضافة
   taskInput.value = "";
   displayTasksForDate(selectedDate);
   renderCalendar();
}

// تعديل التقويم
function renderCalendar() {
   const daysContainer = document.getElementById("calendar-days");
   const header = document.getElementById("calendar-header");
   const now = new Date();
   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   daysContainer.innerHTML = '';
   
   // تحديث أيقونة الشهر
   updateMonthIcon();
   
   // إضافة أسماء الأيام
   dayNames.forEach(day => {
       const dayName = document.createElement('div');
       dayName.className = 'day-name';
       dayName.textContent = day;
       daysContainer.appendChild(dayName);
   });

   const firstDay = new Date(currentYear, currentMonth, 1).getDay();
   const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

   header.innerText = `${monthNames[currentMonth]} ${currentYear}`;

   // إضافة أيام فارغة
   for (let i = 0; i < firstDay; i++) {
       const emptyDiv = document.createElement('div');
       emptyDiv.className = 'empty';
       daysContainer.appendChild(emptyDiv);
   }
   
   // إضافة أيام الشهر
   for (let d = 1; d <= lastDate; d++) {
       const dateObj = new Date(currentYear, currentMonth, d);
       const dateStr = formatDateToString(dateObj);

       const dayDiv = document.createElement("div");
       dayDiv.className = "day-number";

       if (d === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
           dayDiv.classList.add("today");
       }
       if (selectedDate === dateStr) {
           dayDiv.classList.add("selected");
       }
       if (tasks[dateStr] && tasks[dateStr].length > 0) {
           dayDiv.classList.add("has-tasks");
       }

       dayDiv.textContent = d;
       dayDiv.setAttribute("data-date", dateStr);
       dayDiv.addEventListener("click", () => {
           setSelectedDate(dateObj);
       });
       daysContainer.appendChild(dayDiv);
   }
}

// الأحداث
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
   if (e.key === "Enter") {
       addTask();
   }
});

prevMonthBtn.addEventListener("click", () => {
   currentMonth--;
   if (currentMonth < 0) {
       currentMonth = 11;
       currentYear--;
   }
   renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
   currentMonth++;
   if (currentMonth > 11) {
       currentMonth = 0;
       currentYear++;
   }
   renderCalendar();
});

// تهيئة التطبيق
function initializeApp() {
   loadTasksFromLocalStorage(); // تحميل المهام أولاً
   const today = new Date();
   setSelectedDate(today);
   renderCalendar();
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', initializeApp);
console.log("أيام تحتوي على مهام:", Object.keys(tasks));