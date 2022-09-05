// This is a bad pattern, but it's easy.
const fromTo = `
<h2>
  <label for="from">From:</label>
  <input name="from" type="text" class="from" placeholder="Enter AITI Code" />
</h2>
<h2>
  <label for="to">To:</label>
  <input name="to" type="text" class="to" placeholder="Enter AITI Code" />
</h2>
`;

function addBoxes() {
  // Use a div as our base element because the browser renders div's well
  const element = document.createElement("div");
  // We need to have a class to get all of our from/to pairs
  // HTML ID's should be unique.
  element.classList.add("from-to");
  // Set the div's innerHTML to our text above. Not the best pattern, but easy.
  element.innerHTML = fromTo;
  // Find our airports div and add our new from/to pair.
  document.getElementById("airports").append(element);
}

async function getFlightData(from, to, departure) {
  const flightResponse = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(
      `https://skiplagged.com/api/search.php?from=${from}&to=${to}&depart=${departure}`
    )}`
  );
  return flightResponse.json();
}

// Encapsulating the discord messaging
// flightData: {
//    flightCost: <number>
//    from: AITI Code
//    to: AITI Code
// }
// departureTime: The departure time
async function postToDiscord(flightData, departureTime) {
  console.log(flightData, departureTime);
  const discordChannelUrl = `https://discord.com/api/webhooks/1000930577182101506/fF_e4nrjDmGZ6X8ZuKHhdnJFPIL2rYBVAUL6IcHbMXClKOLIhESmGEeCATeoKhqUnrb8`;
  fetch(discordChannelUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // TODO: What you want to send here.
      content: ``,
    }),
  });
}

// We don't want hitting search multiple times to call this multiple times
// so we hold onto our timeout and clear it if the submit is called again.
let timeoutRef;
// We're not utilizing the form data now. It's just re-running against the DOM.
// If you change an input field it'll affect this too. Arguably bad design but whatever.
async function submitForm(event) {
  // Prevent form causing a postback.
  if (event) {
    event.preventDefault();
  }
  // Clear our timeout
  clearTimeout(timeoutRef);

  // Find all elements on the page (document) that have the class "from-to"
  const fromToDomElements = document.querySelectorAll(".from-to");
  // fromToDomElements is a 'NodeList', which isn't iterable the way we want. We can't use 'map'
  const fromToElementsAsAnArray = Array.from(fromToDomElements);
  // Map over our array of from/to div's
  const fromToSet = fromToElementsAsAnArray.map((fromToDiv) => {
    // Since we're working with DOM elements, we need to query for the from input and the to input, then get their value.
    return {
      from: fromToDiv.querySelector(".from").value,
      to: fromToDiv.querySelector(".to").value,
    };
  });

  // This is another way to do the above code!
  // const fromToSet = [];
  // for (const fromToDiv of fromToDomElements) {
  //   fromToSet.push(
  //     { from: fromToDiv.querySelector(".from").value, to: fromToDiv.querySelector(".to").value }
  //   );
  // };

  // Log out our from/to pairs
  console.log(fromToSet);

  /*
   * We now have a set of values we can work with. It looks like:
   * [
   *   { from: some AITI code, to: some other AITI code },
   *   { from: some other AITI code, to: some other other AITI code },
   * ]
   */

  // Find the DOM input element with the ID "time", get its value, and format it for our uses.
  const departureTime = moment(time.value).format("YYYY-MM-DD");

  // Iterate over our set of from/to's and push our request into an array
  // const flightData = [];
  // for (const fromToPair of fromToSet) {
  //   flightData.push(
  //     getFlightData(fromToPair.from, fromToPair.to, departureTime)
  //   );
  // }
  // Await our array of promises to get all our flight data.
  // const flights = await Promise.all(flightData);
  // Map and sort our flight data to get the values we want.
  // const flightDataProcessed = flights.map((_, i) => [flights[i].depart[0][0][0], i]).sort(function (a, b) { return a[0] - b[0] });

  // To do your multi-day search:
  /*
   * const fromToSetMultipleDays = [];
   * for(const i = 0; i < HOWEVER MANY DAYS YOU WANT; i++) {
   *   fromToSet.forEach(fromToPair => fromToSetMultipleDays.push({ ...fromToPair, departureTime: moment(time.value).add(i, "d").format("YYYY-MM-DD") }));
   * }
   *
   * And then below replace:
   * `fromToSet.map(({ from, to }) => getFlightData(from, to, departureTime))`
   *  with
   * `fromToSet.map(({ from, to, departureTime }) => getFlightData(from, to, departureTime))`
   */

  // Inlined, simplified version of the above.
  const flightData = await Promise.all(
    fromToSet.map(({ from, to }) => getFlightData(from, to, departureTime))
  ).then((flights) =>
    flights
      .map((flight, i) => {
        return {
          flightCost: flight.depart[0][0][0],
          // Google object spread operator
          ...fromToSet[i],
          // The above line does the same as the two below lines
          // to: fromToSet[i].to,
          // from: fromToSet[i].from,
        };
      })
      .sort((a, b) => a.flightCost - b.flightCost)
  );
  // Log out our flight data
  console.log(flightData);

  await postToDiscord(flightData, departureTime);

  // Store our timeout so if you press search again it doesn't start two timers.
  timeoutRef = setTimeout(submitForm, 8000);
}

flightSearch.addEventListener("submit", submitForm);
addToFrom.addEventListener("click", addBoxes);
