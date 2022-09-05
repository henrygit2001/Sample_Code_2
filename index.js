var button = document.querySelector('#button')
button.addEventListener("click", AddBoxes)

function AddBoxes(){
    var element = document.createElement("h2");
    var From = element.appendChild(document.createElement("label"));
    From.innerHTML = "From:"
    var FromInput = element.appendChild(document.createElement("input"));
    FromInput.setAttribute("name", "from")
    var To = element.appendChild(document.createElement("label"));
    To.innerHTML = "To:"
    var ToInput = element.appendChild(document.createElement("input"));
    ToInput.setAttribute("name", "to")
    document.getElementById('airports').appendChild(element);
}

async function submitForm(event) {
    event.preventDefault();
    const formData = Array.from(event.target.querySelectorAll("input")).map(e => ({ name: e.name, value: e.value }))
    .reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value}), {});
    console.log(formData);
  
  
    setTimeout(() => {
      submitForm(event)
    }, 8000);
  }
  
  flightSearch.addEventListener("submit", submitForm);