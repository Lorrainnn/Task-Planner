document.addEventListener("DOMContentLoaded", function() {
	// find our welcome message
	const welcomeMessage = document.querySelector('h1'); 

	// top time functions:
	function updateDateTime() {
		const now = new Date();
		
		// time formatting
		let hours = now.getHours();
		const minutes = now.getMinutes();
		const seconds = now.getSeconds();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		
		// convert to 12-hour format
		hours = hours % 12;
		hours = hours ? hours : 12; 
		// handle midnight (when it hits 0 hours)
		
		// pad single digits with leading zero
		const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
		const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
		
		// date formatting
		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		
		const dayName = days[now.getDay()];
		const monthName = months[now.getMonth()];
		const date = now.getDate();
		const year = now.getFullYear();
		
		// create our full clock string
		const timeString = `${hours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
		const dateString = `${dayName}, ${monthName} ${date}, ${year}`;
		
		const clockElement = document.getElementById('clock-display');
		const dateElement = document.getElementById('date-display');
		
		if (clockElement) {
			clockElement.textContent = timeString;
		}
		
		if (dateElement) {
			dateElement.textContent = dateString;
		}
	}
	
	// update every second
	updateDateTime();
	setInterval(updateDateTime, 1000);



	// weather function 
	const checkWeatherButton = document.getElementById('weather-button');
	const apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=33.6424&longitude=-117.8417&current=temperature_2m,is_day&hourly=precipitation&daily=sunrise,sunset&timezone=America%2FLos_Angeles";
	// the above is an api url curated to the UCI campus that fetches temperature, precipitation, and other data
	const botBox = document.getElementById('bot-box');
	const chatMessage = document.getElementById('chat-message');

	// show chat box and display our message
	checkWeatherButton.addEventListener("click", function() {
		notesContainer.style.display = "none";
		welcomeMessage.textContent = "";
		document.querySelector(".chatbox").style.display = "none";
		botBox.style.display = "flex";  // make the chat box visible
		chatMessage.textContent = "Fetching weather data...";  

		// Make the API call
		fetch(apiUrl)
			.then(response => response.json())  // parse the JSON response
			.then(data => {
				const temperature = data.current.temperature_2m;  // current temperature
				const isDay = data.current.is_day;  // day status (1 for day, 0 for night)
				
				// the time during this fetch
				const currentTime = new Date();
				const hours = currentTime.getHours();
				const minutes = currentTime.getMinutes();
				const ampm = hours >= 12 ? 'PM' : 'AM';
				const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' 
					+ minutes : minutes} ${ampm}`;
				
				// determine if it's raining or sunny
				const precipitation = data.hourly.precipitation[0];  // Precipitation data (in mm)
				const weatherCondition = precipitation > 0 ? 'it\'s raining! 🌧️' : 'it\'s not raining outside! ☁️';
				// if precipitation > 0, it's raining

				// Determine greeting based on time of day
				let greeting = isDay === 1 ? "Good morning! 🌇" : "Good evening! 🌃";
				
				welcomeMessage.innerHTML = `${greeting}`;
				// update the message with the temperature, greeting, time, and weather condition
				chatMessage.innerHTML = `<p style="font-size:1.15rem; margin:0%">
				The current temperature on the UCI campus is <b>${temperature}°C.</b><br>
				The time is ${formattedTime}, and ${weatherCondition}<br>
				</p>`;
			})
			.catch(error => {
				// handle any errors that occur during the fetch
				console.error("Error fetching the weather data:", error);
				chatMessage.textContent = "Sorry, there was an error fetching the weather data.";
			});
	});
	

	// tasks function
	const taskInput = document.getElementById('task-input');

	function renderTasks() {
		// how to render our tasks
		welcomeMessage.textContent = "Add a new task below! 📑";
		let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
		// our formatted way
		chatMessage.innerHTML = `<h1 style="margin:0px; font-weight:700; text-align:left">Current tasks: </h1>
				${tasks.map((task, index) => `
				<button class="delete-task" data-index="${index}">❌</button>    
				<button class="edit-task" data-index="${index}">✏️</button>
				${task.task} 
		`).join('<br>')} <br>`;
		

		// event listeners for edit and delete buttons
		document.querySelectorAll('.edit-task').forEach(button => {
			button.addEventListener('click', function() {
				welcomeMessage.textContent = "Please enter the renamed task:";
				const index = this.getAttribute('data-index');
				let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
				// modify the local storage's task that we select
				taskInput.value = tasks[index].task;
				taskInput.dataset.editIndex = index;
			});
		});
		
		document.querySelectorAll('.delete-task').forEach(button => {
			button.addEventListener('click', function() {
				const index = this.getAttribute('data-index');
				let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
				tasks.splice(index, 1);
				localStorage.setItem('tasks', JSON.stringify(tasks));
				// trash the user selected task
				renderTasks();
				welcomeMessage.textContent = "Task deleted! 🗑️";
			});
		});
	}

	
	// modify task input to handle both new and edited tasks
	taskInput.addEventListener("keypress", function(event) {
		if (event.key === "Enter") {
			const task = taskInput.value.trim();
			let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

			if (task) {
				if (this.dataset.editIndex !== undefined) {
					// edit existing task
					const editIndex = parseInt(this.dataset.editIndex);
					tasks[editIndex] = { task: task };
					delete this.dataset.editIndex;
				} else {
					// add new task
					tasks.push({ task: task });
				}

				localStorage.setItem('tasks', JSON.stringify(tasks));
				taskInput.value = '';
				renderTasks();
				welcomeMessage.textContent = "Task committed! ✍️";
			} else {
				chatMessage.textContent = "Please enter a valid task!";
			}
		}
	});

	// call renderTasks when new task button is clicked
	document.getElementById("new-task-button").addEventListener("click", function() {
		document.querySelector(".chatbox").style.display = "block";
		document.getElementById('bot-box').style.display = "flex";
		notesContainer.style.display = "none";
		renderTasks();
	});


	// note buttons + functions
	const noteButton = document.getElementById('note-button');
	const notesContainer = document.getElementById('notes-container');
	const addNoteButton = document.getElementById('add-note-button');
	const noteList = document.getElementById('note-list');

	function deleteEmptyNotes() {
		// we want the webpage to call this in order to rid empty note boxes
		const noteBoxes = document.querySelectorAll('.note-box');
		let notes = [];
		let emptyCount = 0;
		
		noteBoxes.forEach(noteBox => {
			const textarea = noteBox.querySelector('textarea');
			if (textarea && textarea.value.trim() === '') {
				emptyCount++;
				if (emptyCount > 1) {
					noteBox.remove();  // remove extra empty notes
				} else {
					notes.push({ content: '' }); // keep one empty note
				}
			} else if (textarea) {
				notes.push({ content: textarea.value.trim() });
			}
		});
		
		localStorage.setItem('notes', JSON.stringify(notes)); 
		// save updated notes to local storage
	}
	
	function saveNotes() {
		const noteBoxes = document.querySelectorAll('.note-box');
		const notes = Array.from(noteBoxes).map(noteBox => {
			const textarea = noteBox.querySelector('textarea');
			return { content: textarea ? textarea.value.trim() : '' };
			// core function to save notes that the user wants
		});
		localStorage.setItem('notes', JSON.stringify(notes));
	}

	// toggle the notes container visibility when the notes button is clicked
	noteButton.addEventListener("click", function() {
		welcomeMessage.textContent = "Feel free to add any notes! 📔";
		deleteEmptyNotes();
		notesContainer.style.display = "block";
		document.querySelector(".chatbox").style.display = "none";
		document.getElementById('bot-box').style.display = "none";
		renderNotes(); // render notes from local storage
	});

	// add a new note box when the "Add Note" button is clicked
	addNoteButton.addEventListener("click", function() {
		welcomeMessage.textContent = "Note added! ✍️";
		const newNoteBox = document.createElement('div');
		newNoteBox.classList.add('note-box');
		
		const newTextArea = document.createElement('textarea');
		newTextArea.classList.add('note-input');
		newTextArea.rows = 5;
		newTextArea.cols = 30;
		newTextArea.placeholder = "Write your note here...\n\n(To delete notes, simply empty it!)";
		
		newNoteBox.appendChild(newTextArea);
		noteList.appendChild(newNoteBox);
		
		// add an event listener to each new note's textarea for the blur event
		//  blur being to detect the user's pointer clicks focusing out and into boxes
		newTextArea.addEventListener("blur", function() {
			saveNotes();  // save notes whenever the user switches focus
		});
		
		saveNotes();  // save notes immediately after adding a new one
	});
	
	function renderNotes() {
		const notes = JSON.parse(localStorage.getItem('notes')) || [];
		noteList.innerHTML = ''; // clear the note list before rendering
		
		notes.forEach(note => {
			const newNoteBox = document.createElement('div');
			newNoteBox.classList.add('note-box');
			
			const newTextArea = document.createElement('textarea');
			newTextArea.classList.add('note-input');
			newTextArea.rows = 5;
			newTextArea.cols = 30;
			newTextArea.placeholder = "Write your note here...";
			newTextArea.value = note.content; // populate the textarea with saved content
			
			newNoteBox.appendChild(newTextArea);
			noteList.appendChild(newNoteBox);
			
			newTextArea.addEventListener("blur", function() {
				saveNotes();  // save notes whenever the user switches focus
				deleteEmptyNotes();  // automatically delete empty notes
			});
		});
	}

});