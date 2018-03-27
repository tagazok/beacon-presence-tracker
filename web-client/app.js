document.addEventListener("DOMContentLoaded", function() {
  const default_sensor_color = "#c6c6c6";
  const agents = {
    agent1: {
      cx: 20,
      cy: 20,
      element: document.querySelector("#agent1")
    },
    agent2: {
      cx: 550,
      cy: 20,
      element: document.querySelector("#agent2")
    },
    agent3: {
      cx: 285,
      cy: 392,
      element: document.querySelector("#agent3")
    }
  };

  users = {};
  const userElement = document.querySelector("#beacon");
  const jsonElement = document.querySelector("#json");

  for(let agent of Object.values(agents)) {
    agent.element.setAttribute("cx", agent.cx);
    agent.element.setAttribute("cy", agent.cy);
    agent.element.setAttribute("fill", default_sensor_color);
  }

  const eventSource = new EventSource(`http://192.168.1.27:9988/events`);
  eventSource.onmessage = event => {
    console.log(event);
    handleData(JSON.parse(event.data));
  };

  function handleData(data) {
    users[data.mac] = data;
    jsonElement.innerHTML = JSON.stringify(users, null, 2);
    console.log(data.closest_agent);
    if (data.closest_agent !== "") {
      agents[data.closest_agent].element.setAttribute("fill", "red");
    }

    // displayBeacon(data);
    initColors(data.closest_agent);
  }

  function square(a) {
    return a * a;
  }

  // function displayBeacon(data) {
  //   const realDistance = data.agents.beacon1 + data.agents.beacon2;
  //   const drawingDistance = Math.sqrt(
  //     square(agents.beacon2.cx - agents.beacon1.cx) +
  //       square(agents.beacon2.cy - agents.beacon1.cy)
  //   );

  //   const distanceToClosest =
  //     data.agents[data.closest_agent] * drawingDistance / realDistance;
    
  //   userElement.setAttribute("cx", agents.beacon1.cx + distanceToClosest);
  //   userElement.setAttribute("cy", agents.beacon1.cy);
  // }

  function initColors(except) {
    for (let [name, agent] of Object.entries(agents)) {
      if (name !== except) {
        agent.element.setAttribute("fill", default_sensor_color);
      }
    }
  }
});
