var currentMonthIndex = new Date().getMonth();
var monthGrid = document.getElementById("monthGrid");
var monthHeader = document.getElementById("monthHeader");
var prevMonthBtn = document.getElementById("prevMonthBtn");
var nextMonthBtn = document.getElementById("nextMonthBtn");

var taskNumber = 0;
var deadlinesVector = [];

function addTask(clicked_id)
{
    var x = document.getElementById("newTask").value;
    if (clicked_id == "0")
    {
        var listItem = document.createElement("li");
        listItem.dataset.taskNumber = taskNumber;
        deadlinesVector[taskNumber] = null;
        taskNumber++;
        listItem.innerHTML = x + " <button onclick='completeTask(this)'>Complete Task</button> <button onclick='setDeadline(this)'>Set Deadline</button> <button onclick='deleteTask(this)'>Delete Task</button> ";

	var renameButton = document.createElement("button");
        renameButton.textContent = "Rename Task";
        renameButton.onclick = function()
	{
            renameTask(listItem);
        };
        listItem.appendChild(renameButton);
        
        var startDateId = Date.now();
        var startDateElement = document.createElement("span");
        startDateElement.id = startDateId;
        startDateElement.innerHTML = "<br>Start Day: " + getCurrentDate() + " ";
        
        var editStartDayButton = document.createElement("button");
        editStartDayButton.textContent = "Edit Start Day";
        editStartDayButton.onclick = function() { editStartDay(startDateId); };
        
        editStartDayButton.classList.add('edit-start-day-btn');
  	editStartDayButton.dataset.startDateId = startDateId;
        
        listItem.appendChild(startDateElement);
        listItem.appendChild(editStartDayButton);
        setupEditStartDayButton();
        
        document.getElementById("pendingTaskList").appendChild(listItem);
    }

    saveTasksToLocalStorage();
}

function completeTask(button) {
    var listItem = button.parentElement;
    var taskText = listItem.firstChild.nodeValue;
    var originalTaskNumber = parseInt(listItem.dataset.taskNumber);
    listItem.remove();

    var completedTaskList = document.getElementById("completedTaskList");
    var newListItem = document.createElement("li");
    newListItem.dataset.taskNumber = originalTaskNumber;
    deadlinesVector[originalTaskNumber] = null;

    newListItem.appendChild(document.createTextNode(taskText));
    completedTaskList.appendChild(newListItem);

    saveTasksToLocalStorage();
    saveDeadlinesToLocalStorage();
}

function editStartDay(startDateId)
{
    var datePicker = document.getElementById("datePicker");
    datePicker.style.display = "block";
    datePicker.dataset.taskId = startDateId;
    datePicker.dataset.dateType = "start";

    saveTasksToLocalStorage();
}

function setDeadline(button)
{
    var taskIndex = parseInt(button.parentElement.dataset.taskNumber);
    var deadlineId = Date.now();
    var deadlineElement = document.createElement("span");
    deadlineElement.id = deadlineId;

    var datePicker = document.getElementById("datePicker");
    datePicker.style.display = "block";
    datePicker.dataset.taskId = deadlineId;
    datePicker.dataset.dateType = "deadline";
    datePicker.dataset.taskIndex = taskIndex;

    var dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.id = "datePickerInput";

    var setButton = document.createElement("button");
    setButton.textContent = "Set Date";
    setButton.onclick = function()
    {
	updateDate();
	button.style.display = "none";
	saveDeadlinesToLocalStorage();
    };

    datePicker.innerHTML = "";
    datePicker.appendChild(dateInput);
    datePicker.appendChild(setButton);
    
    button.parentElement.appendChild(deadlineElement);
    saveTasksToLocalStorage();
}

function editDeadline(deadlineId, taskIndex)
{
    var datePicker = document.getElementById("datePicker");
    datePicker.style.display = "block";
    datePicker.dataset.taskId = deadlineId;
    datePicker.dataset.dateType = "deadline";
    datePicker.dataset.taskIndex = taskIndex;

    saveTasksToLocalStorage();
}

function updateDate()
{
    var datePicker = document.getElementById("datePicker");
    var dateInput = document.getElementById("datePickerInput");
    var taskId = datePicker.dataset.taskId;
    var dateType = datePicker.dataset.dateType;
    var taskIndex = parseInt(datePicker.dataset.taskIndex);

    var selectedDate = dateInput.value;
    var dateElement = document.getElementById(taskId);
 
    if (dateType === "start")
      dateElement.innerHTML = "<br>Start Day: " + selectedDate + " ";
    else
    {
      if (dateType === "deadline")
      {
	dateElement.innerHTML = "<br>Deadline: " + selectedDate + " <button onclick='editDeadline(" + taskId + ", " + taskIndex + ")'>Edit Deadline</button>";
	deadlinesVector[taskIndex] = selectedDate;
	saveDeadlinesToLocalStorage();
      }
      else
      {
	if (dateType === "displayDay")
      	  updateTasksForSelectedDay(selectedDate);
      }
    }

    datePicker.style.display = "none";
    dateInput.value = "";

    saveTasksToLocalStorage();
}

function displayTasksForDay()
{
    var datePicker = document.getElementById("datePicker");
    datePicker.style.display = "block";
    datePicker.dataset.dateType = "displayDay";
}

function displayAllTasks()
{
    var pendingTasks = document.getElementById("pendingTaskList");
    var completedTasks = document.getElementById("completedTaskList");
    
    for (var i = 0; i < pendingTasks.children.length; i++)
      pendingTasks.children[i].style.display = "list-item";
    
    for (var j = 0; j < completedTasks.children.length; j++)
      completedTasks.children[j].style.display = "list-item";
}

function updateTasksForSelectedDay(selectedDate)
{
    var pendingTasks = document.getElementById("pendingTaskList");
    
    for (var i = 0; i < pendingTasks.children.length; i++)
    {
        var task = pendingTasks.children[i];
        var taskDate = deadlinesVector[parseInt(task.dataset.taskNumber)];
        if (taskDate === selectedDate)
            task.style.display = "list-item";
        else
            task.style.display = "none";
    }
}

function renameTask(taskElement)
{
    var newName = prompt("Enter the new name for the task:");
    if (newName !== null) {
        taskElement.firstChild.nodeValue = newName + " ";
        saveTasksToLocalStorage();
    }
}

function deleteTask(button) {
    var taskIndex = parseInt(button.parentElement.dataset.taskNumber);
    button.parentElement.remove();
    deadlinesVector.splice(taskIndex, 1, null);
    // taskNumber--;

    saveTasksToLocalStorage();
    saveDeadlinesToLocalStorage();
}

function prevMonth()
{
    currentMonthIndex = (currentMonthIndex - 1 + 12) % 12;
    updateCalendar();
    updateArrowsVisibility();
}

function nextMonth()
{
    currentMonthIndex = (currentMonthIndex + 1) % 12;
    updateCalendar();
    updateArrowsVisibility();
}

function updateArrowsVisibility()
{
    if (currentMonthIndex === 0)
      prevMonthBtn.style.display = "none";
    else
      prevMonthBtn.style.display = "inline-block";

    if (currentMonthIndex === 11)
      nextMonthBtn.style.display = "none";
    else
      nextMonthBtn.style.display = "inline-block";
}

function updateCalendar()
{
    var currentYear = new Date().getFullYear();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    monthHeader.textContent = monthNames[currentMonthIndex] + " " + currentYear;
    monthGrid.innerHTML = "";

    for (var i = 1; i <= daysInMonth; i++)
    {
      var dayElement = document.createElement("div");
      dayElement.classList.add("day");
      dayElement.textContent = i;
      monthGrid.appendChild(dayElement);
    }
}
  
function getCurrentDate()
{
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    return year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
}

function saveTasksToLocalStorage()
{
    var pendingTasks = document.getElementById("pendingTaskList").innerHTML;
    var completedTasks = document.getElementById("completedTaskList").innerHTML;

    localStorage.setItem("pendingTasks", pendingTasks);
    localStorage.setItem("completedTasks", completedTasks);
    localStorage.setItem("taskNumber", taskNumber);
}

function saveDeadlinesToLocalStorage()
{
    localStorage.setItem("deadlinesVector", JSON.stringify(deadlinesVector));
}

function loadTasksFromLocalStorage()
{
    var pendingTasks = localStorage.getItem("pendingTasks");
    var completedTasks = localStorage.getItem("completedTasks");

    if (pendingTasks)
      document.getElementById("pendingTaskList").innerHTML = pendingTasks;

    if (completedTasks)
      document.getElementById("completedTaskList").innerHTML = completedTasks;
}

function loadDeadlinesFromLocalStorage()
{
    var storedDeadlines = localStorage.getItem("deadlinesVector");
    if (storedDeadlines)
        deadlinesVector = JSON.parse(storedDeadlines);
}

function loadTaskNumberFromLocalStorage()
{
    var storedTaskNumber = localStorage.getItem("taskNumber");
    if (storedTaskNumber)
        taskNumber = parseInt(storedTaskNumber);
    else
        taskNumber = 0;
}

function setupEditStartDayButton()
{
    var editStartDayButtons = document.querySelectorAll('.edit-start-day-btn');

    editStartDayButtons.forEach(function(button)
    {
      button.addEventListener('click', function()
      {
        var startDateId = button.dataset.startDateId;
        editStartDay(startDateId);
      });
    });
}

function setupBackToPendingButton()
{
    var backToPendingButtons = document.querySelectorAll('.back-to-pending-btn');

    backToPendingButtons.forEach(function(button)
    {
      button.addEventListener('click', function()
      {
        moveTaskToPending(button.parentElement);
      });
    });
}

function setupRenameTaskButton()
{
    var renameTaskButtons = document.querySelectorAll('li button:nth-of-type(4)');

    renameTaskButtons.forEach(function(button)
    {
        button.addEventListener('click', function()
	{
            var taskElement = button.parentElement;
            renameTask(taskElement);
        });
    });
}

window.onload = function()
{
    loadTasksFromLocalStorage();
    loadDeadlinesFromLocalStorage();
    loadTaskNumberFromLocalStorage();
    updateCalendar();
    updateArrowsVisibility();
    setupEditStartDayButton();
    setupBackToPendingButton();
    setupRenameTaskButton();
}

function clearLocalStorage()
{
    localStorage.removeItem("pendingTasks");
    localStorage.removeItem("completedTasks");
    localStorage.removeItem("deadlinesVector");
    localStorage.removeItem("taskNumber");
    taskNumber = 0;

    document.getElementById("pendingTaskList").innerHTML = "";
    document.getElementById("completedTaskList").innerHTML = "";
}

updateCalendar();
updateArrowsVisibility();