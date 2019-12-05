/*******************************************
  Initialization functions
********************************************/
const initializeSpeechSynthesis = () => {
  if("speechSynthesis" in window && "SpeechSynthesisUtterance" in window){
     const synth = window.speechSynthesis;
     const utterThis = new SpeechSynthesisUtterance();
     utterThis.rate = 1.3;
     synth.cancel();
     return {synth, utterThis};
  }
  else {
    console.warn("Speech Synthesis API is not available with your broswer. There will be no voice notification of each exercise.");
    return {synth: undefined, utterThis: undefined};
  }
}

/*******************************************
  Initialization variables
********************************************/
const {synth, utterThis} = initializeSpeechSynthesis();
let isPaused = false,
    isStarted = false;
let noSleep = new NoSleep();

/*******************************************
  Settings (to be queried from JSON or local storage)
********************************************/
let notifySecondsToNextExercise = 3;
let flashBackgroundOn = false;
let notificationOn = true;

/*******************************************
  DOM elements
********************************************/
const $timer = document.getElementById('timer');
const $timerSeconds = $timer.querySelector('.timerSeconds');
const $timerAction = $timer.querySelector('.timerAction');
const $timerNextAction = $timer.querySelector('.timerNextAction');

const $notificationSound1 = $timer.querySelector('audio#notification1'),
      $notificationSound2 = $timer.querySelector('audio#notification2');

const $prevButton = $timer.querySelector('#prev'),
      $nextButton = $timer.querySelector('#next'),
      $closeButton = $timer.querySelector('#end'),
      $pauseButton = $timer.querySelector('#pause');

const $workoutTemplate = document.querySelector('#workouts-template'),
      $workoutsContainer = document.querySelector('.exercises');

/*******************************************
  Utility functions
********************************************/
const roundToOneDecimal = (n) => Math.round(n * 10) / 10;

/*******************************************
  Templating functions
********************************************/
const flashBackground = (background, duration = 300) => {
  background.style.backgroundColor = '#fb5686';
  if(!isPaused) {
    setTimeout(() => {
      background.style.backgroundColor = 'white';
    }, duration);
  }
}

const playNotification = (notificationSound) => {
  if(!isPaused) {
    notificationSound.currentTime = 0;
    notificationSound.play();
  }
}

const getActionSpeech = (action, seconds = "") => {
  return `${action}. ${typeof seconds === "number" ? `${seconds} seconds.` : seconds}`;
}

const getNextActionSpeech = (nextAction, totalSeconds) => {
  if(totalSeconds > 10)
    return `You're almost done. ${nextAction === "last exercise" ? `This is the ${nextAction}.` : `Next: ${nextAction}.`}`;
  if(totalSeconds === 10)
    return `Next: ${nextAction}`;
}

const speakAction = (speech = "", synth, utterThis) => {
  if(!synth || !utterThis) return;
  utterThis.text = speech;
  synth.speak(utterThis);
  if(isPaused) synth.pause();
}

const showNextAction = (nextAction) => $timerNextAction.textContent = ["", "last exercise"].includes(nextAction) ? nextAction : `Next: ${nextAction}`;

const showAction = (action) => $timerAction.textContent = action;

const showSecond = (second) => $timerSeconds.textContent = second;

const processSecond = (remainingSeconds, totalSeconds, nextAction) => {
  showSecond(remainingSeconds);
  if(isPaused) return;
  if(remainingSeconds <= notifySecondsToNextExercise){
    if(flashBackgroundOn) flashBackground($timer);
    if(notificationOn) {
      if(remainingSeconds !== 0) playNotification($notificationSound1);
      else playNotification($notificationSound2);
    }
  }

  if(remainingSeconds === 10) {
    let speech = getNextActionSpeech(nextAction, totalSeconds);
    speakAction(speech, synth, utterThis);
  }
}

const updateButton = (button, textContent) => button.textContent = textContent;

const listWorkouts = (workouts, workoutNames, template) => {
  workouts.forEach((workout, index, self) => {
    const workoutDuration = totalWorkoutDuration(workout);
    const workoutTemplate = template.content.cloneNode(true);
    workoutTemplate.querySelector('.action h2').textContent = workoutNames[index];
    workoutTemplate.querySelector('.action span').textContent = `${roundToOneDecimal(workoutDuration.total)} minutes ∙ ${roundToOneDecimal(workoutDuration.on)} minutes on ∙ ${roundToOneDecimal(workoutDuration.rest)} minutes rest`;
    // link to exercise list page workout.html with parameter with workout id...
    workoutTemplate.querySelector('.start-button button').dataset.workoutid = index;
    $workoutsContainer.insertBefore(workoutTemplate, template);
  });
}

/*******************************************
  Workouts data
********************************************/
const workoutArms = [
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Bicep Curls", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Rows, Right Arm", seconds: 30},
        {action: "Rest", seconds: 10},
        {action: "Dumbbell Rows, Left Arm", seconds: 30},
      ];

const workoutTest = [
        {action: "Bicep Curls", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Lateral Shoulder Raises", seconds: 20},
        {action: "Rest", seconds: 20},
        {action: "Dumbbell Rows, Right Arm", seconds: 20}
      ];

const workoutLegs = [
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Goblet Squats", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Glute Bridges", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Deadlift with Dumbbells", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Calf Raises", seconds: 30}
      ];

const workoutShoulders = [
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Lateral Shoulder Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Tricep Dips", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Dumbbell Front Raises", seconds: 30},
        {action: "Rest", seconds: 30},
        {action: "Overhead Tricep Extensions", seconds: 30}
]

const workouts = [workoutLegs, workoutArms, workoutShoulders, workoutTest];
const workoutsTitles = ["Girl Power Legs", "Bunny Arms", "Bunny Shoulders", "For Testing"];
/*******************************************
  Workouts functions
********************************************/
const countDown = ({ action, seconds, nextAction}, currentActionIndex) => {
    return new Promise(function (resolve) {
        let remainingSeconds = seconds;
        showAction(action);
        showNextAction(nextAction);
        speakAction(getActionSpeech(action, remainingSeconds), synth, utterThis);
        processSecond(remainingSeconds, seconds, nextAction);

        let timer = setInterval(() => {
          if(!isPaused) remainingSeconds--;
          processSecond(remainingSeconds, seconds, nextAction);

          if(remainingSeconds === 0){
            clearInterval(timer);
            currentActionIndex++;
            setTimeout(() => resolve(currentActionIndex), 1000);
          }
        }, 1000);

        const resolveImmediately = () => {
          synth.cancel();
          clearInterval(timer);
          resolve(currentActionIndex);
        }

        $prevButton.onclick = () => {
          currentActionIndex = Math.max(0, currentActionIndex - 1);
          resolveImmediately();
        }

        $nextButton.onclick = () => {
          currentActionIndex++;
          resolveImmediately();
        }

        $closeButton.onclick = () => {
          currentActionIndex = undefined;
          resolveImmediately();
          noSleep.disable();
          $timer.style.visibility = 'hidden';
        }
      });
}

const endWorkOut = (action = "Workout complete. Good job!") => {
  return new Promise(function (resolve) {
    showAction(action);
    speakAction(action, synth, utterThis);
    showSecond("");
    showNextAction("");
    $timer.classList.add('workout-ended');
    isStarted = false;
    $prevButton.onclick = null;
    $nextButton.onclick = null;
    noSleep.disable();
    resolve();
  });
}

const startWorkOut = async (workout) => {
  let currentActionIndex = -1;

  $timer.style.visibility = 'visible';
  $timer.classList.remove('workout-ended');
  isPaused = false;
  isStarted = true;

  currentActionIndex = await countDown({action: "Get ready", seconds: 10, nextAction: (workout[0]).action}, currentActionIndex);

  while(workout[currentActionIndex]){
    let exercise = {...workout[currentActionIndex]};
    let nextExercise = workout[currentActionIndex + 1];
    exercise.nextAction = nextExercise ? nextExercise.action : "last exercise";
    currentActionIndex = await countDown(exercise, currentActionIndex);
  }
  if(currentActionIndex) await endWorkOut();
}

const pauseWorkOut = () => {
  isPaused = !isPaused;
  updateButton($pauseButton, isPaused ? 'resume' : 'pause');
  if(isPaused){
    if(synth.speaking) synth.pause();
  }
  else {
    if(synth.speaking) synth.resume();
  }
}

const totalWorkoutDuration = (workout = []) => {
  const duration = workout.reduce((total, exercise) => {
                      if(exercise.action.toLowerCase() === "rest"){
                        total.rest += exercise.seconds / 60;
                      } else {
                        total.on += exercise.seconds / 60;
                      }
                      return total;
                  }, {rest: 0, on: 0});
  duration.total = duration.on + duration.rest;
  return duration;
}

/*******************************************
  Event listeners and handlers
********************************************/
const keyHandler = (e) => {
  e.preventDefault();
  if(e.keyCode !== 32) return;

  if(!isStarted){
    startWorkOut(workoutTest); // will need to grab current workout eventually
    noSleep.enable();
  }
  else
    pauseWorkOut();
}

const startClick = (e) => {
  if(!e.target.matches('.start-button button')) return 
  startWorkOut(workouts[e.target.dataset.workoutid]);
  noSleep.enable();
}

const clickHandler = (e) => {
  startClick(e);
}

document.addEventListener('keydown', keyHandler);
document.addEventListener('click', clickHandler);

/*******************************************
  Load page data
********************************************/
listWorkouts(workouts, workoutsTitles, $workoutTemplate);