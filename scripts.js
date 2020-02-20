/*******************************************
  DOM elements
********************************************/
const $workoutTemplate = document.querySelector('#workouts-template'),
      $workoutsContainer = document.querySelector('.exercises');

/*******************************************
  Utility functions
********************************************/
const roundToOneDecimal = (n) => Math.round(n * 10) / 10;

const totalWorkoutDuration = (workout = []) => {
  const duration = workout.reduce((total, exercise) => {
                      if(exercise.action.toLowerCase() === "rest"){
                        total.rest += exercise.seconds; // / 60;
                      } else {
                        total.on += exercise.seconds; // / 60;
                      }
                      return total;
                  }, {rest: 0, on: 0});
  duration.total = duration.on + duration.rest;
  return duration;
}

/*******************************************
  Templating functions
********************************************/

const populateWorkoutsSummaryTemplate = (template = $workoutTemplate, workoutObj) => {
    const workoutTemplate = template.content.cloneNode(true);
    workoutTemplate.querySelector('.action h2').textContent = workoutObj.name;
    workoutTemplate.querySelector('.action span').textContent =
      `${roundToOneDecimal((workoutObj.rest + workoutObj.on) / 60)} minutes ∙ ${roundToOneDecimal(workoutObj.on / 60)} minutes on ∙ ${roundToOneDecimal(workoutObj.rest / 60)} minutes rest`;
    workoutTemplate.querySelector('a').href = `workouts.html?${workoutObj.custom ? "custom&" : ""}workout=${workoutObj.id}`;
    return workoutTemplate;
}

const listWorkouts = async (template) => {
  const feed = await fetch(`feeds/workouts.json`);
  const json = await feed.json();
  const fragment = document.createDocumentFragment();
  
  Object.entries(json).forEach(([key, value]) => {
    let workoutTemplate = populateWorkoutsSummaryTemplate(template, {id: key, 
                                               name: value.name, 
                                               rest: value.rest, 
                                               on: value.on,
                                               custom: false}); 
    fragment.appendChild(workoutTemplate);
  });
  $workoutsContainer.insertBefore(fragment, template);
}

// leverage the totalWorkoutDuration function in the create custom workout page

const listCustomWorkouts = (template) => {
  const customWorkouts = JSON.parse(localStorage.getItem('customWorkouts')) || {};
  const fragment = document.createDocumentFragment();
  
  if(Object.keys(customWorkouts).length > 0) {
      Object.entries(customWorkouts).forEach(([key, value]) => {
        let workoutTemplate = populateWorkoutsSummaryTemplate(template, {id: key, 
                                               name: value.name, 
                                               rest: value.rest, 
                                               on: value.on, 
                                               custom: true});
        fragment.appendChild(workoutTemplate);
      });
    }
  else {
      let p = document.createElement('p');
      p.innerHTML = "Your custom workouts will show up here. You currently do not have any. Create one <a href='/create.html'>here</a>";
      fragment.appendChild(p);
    }
  $workoutsContainer.insertBefore(fragment, document.querySelector('#premade-workouts'));
}


/*******************************************
  Load page data
********************************************/
listWorkouts($workoutTemplate); // pre-made exercises
listCustomWorkouts($workoutTemplate); // custom exercises in localStorage