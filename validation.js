    const inputHasError = (field) => {
      // Don't validate submits, buttons, file and reset inputs, and disabled fields
      if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

      // Get validity object
      var validity = field.validity;

      // If valid, return null
      if (validity.valid) return;
      
      // If field is required and empty
      if (validity.valueMissing) return 'Please fill out this field.';
      
      // If not the right type
      if (validity.typeMismatch) return 'Please use the correct input type.';

      // If too short
      if (validity.tooShort) return 'Please lengthen this text.';

      // If too long
      if (validity.tooLong) return 'Please shorten this text.';

      // If number input isn't a number
      if (validity.badInput) return 'Please enter a number.';

      // If a number value doesn't match the step interval
      if (validity.stepMismatch) return 'Please select a valid value.';

      // If a number field is over the max
      if (validity.rangeOverflow) return 'Please select a smaller value.';

      // If a number field is below the min
      if (validity.rangeUnderflow) return 'Please select a larger value.';

      // If pattern doesn't match
      if (validity.patternMismatch) return 'Please match the requested format.';

      // If all else fails, return a generic catchall error
      return 'The value you entered for this field is invalid.';
    }
    
    const showError = (field, errorMessage) => {
      // highlight field with error
      field.classList.add('error', 'active');
      
      let span;
      
      // error span doesn't exist yet, add it
      if(field.nextElementSibling === null || !field.nextElementSibling.matches('.error-message')){
        span = document.createElement('span');
        span.classList.add('error-message');
        field.parentNode.insertBefore(span, field.nextSibling);
      } 
      
      // error span exists already
      else {
        span = field.nextSibling;
      }
      
      // set error message in the error span
      span.innerHTML = `${errorMessage} 
                        <br />${field.title ? field.title : ''}`;
    }
    
    const removeError = (field) => {
      // remove error highlight from field
      field.classList.remove('error', 'active');
      
      // hide the error span
      if(field.nextElementSibling !== null && field.nextElementSibling.matches('.error-message')){
        field.nextElementSibling.style.display = 'none';
      }
    }
    
    const customDropdownHasError = (check) => {
      /**
        check = { element: DOM element,
                  required: true or false,
                  validation: 'number' or 'text',
                  regex: RegExp object or string}
      **/
      
      // helper function: check is number
      const isNumber = (n) => typeof n == 'number' && !isNaN(n) && isFinite(n);
      
      // helper function: check if value matches regular expression
      const matchesRegex = (value, regex) => {
        if (!regex) return true;
        if (regex instanceof RegExp) return regex.test(value);
        let newRegex = new RegExp(regex);
        return newRegex.test(value);
      }
      
      // validate value against type (number or text)
      const isValid = (value, validationType, regex) => {
        switch(validationType){
          case 'number':
            return isNumber(parseInt(value)) && matchesRegex(value, regex);
            break;
          case 'text':
            return typeof value == "string" && matchesRegex(value, regex);
            break;
          case undefined:
            return true;
            break;
          default:
            return false;
        }
      }
      
      // grab value from DOM element
      let value = check.element.value || check.element.textContent;
      
      // required field has content, validate against type and regex if available
      if(check.required && value.trim().length > 0) {
        if (!isValid(value, check.validation, check.regex))
          return 'Please make a selection.'
      } 
      // empty required fields return false
      else if(check.required && value.trim().length === 0) {
        return 'Please make a selection.'
      }
      // non-required field has content: validate against type and regex if available
      else if(value.trim() !== "") {
          if(!isValid(value, check.validation, check.regex))
            return 'Please make a valid selection.'
      }
      // non-required field is empty return null;
      else {
          return;
      }
    }