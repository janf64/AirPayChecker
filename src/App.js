import React, { useState } from 'react';

function App() {
  const [trips, setTrips] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [metersDelivered, setMetersDelivered] = useState(0);
  const [loadTrailerMinutes, setLoadTrailerMinutes] = useState(0);
  const [loadTrailerDelayMinutes, setLoadTrailerDelayMinutes] = useState(0);
  const [ot1_5Checked, setOT1_5Checked] = useState(false);
  const [ot2Checked, setOT2Checked] = useState(false);
  const [startDayChecked, setStartDayChecked] = useState(false);

  const calculateTripCost = (distance) => {
    if (distance <= 160) {
      return 0.6418 * distance;
    } else if (distance <= 360) {
      return 0.6037 * distance;
    } else if (distance <= 1000) {
      return 0.5474 * distance;
    } else {
      return 0.4904 * distance;
    }
  };

  const calculateProductCost = (product) => {
    if (product === 'Argon') {
      return 0.004539;
    } else if (product === 'CO2') {
      return 0.003102;
    } else if (product === 'Oxygen' || product === 'Nitrogen') {
      return 0.003524;
    } else if (product === 'N2o') {
      return 0.003148;
    } else {
      return 0;
    }
  };

  const products = [
    ['Argon', 0.1],
    ['CO2', 0.2],
    ['Oxygen', 0.3],
    ['Nitrogen', 0.3],
    ['N2o', 0.3],
  ];

  const activities = [
    { name: 'LoadTrlr ', duration: 60 },
    { name: 'DrpTrctr ', duration: 10 },
    { name: 'DelSetup ', duration: 20 },
    { name: 'Fuel Trck ', duration: 10 },
    { name: 'Scale ', duration: 5 },
    { name: 'FuelTrlr ', duration: 5 },
    { name: 'Def ', duration: 5 },
    { name: 'DrpTrlr ', duration: 10 },
    { name: 'StarDay ', duration: 35 },
    { name: 'EndDay ', duration: 10 },
    { name: 'PckTrctr ', duration: 10 },
    { name: 'PckTrlr ', duration: 15 },
    { name: 'PckCylTrlr ', duration: 25 },
    { name: 'DelayMin ', duration: 1 },
    { name: 'DelayMin10 ', duration: 10 },
    { name: '1.5xDay ', duration: 1 },
    { name: '2xDay ', duration: 1 },
  ];

  const addTrip = () => {
    setTrips([...trips, { distance: 0, product: '', metersDelivered: 0, selectedActivities: [] }]);
  };

  const updateTripDistance = (index, distance) => {
    const updatedTrips = [...trips];
    updatedTrips[index].distance = distance;
    setTrips(updatedTrips);
  };

  const updateTripProduct = (index, product) => {
    const updatedTrips = [...trips];
    updatedTrips[index].product = product;
    setTrips(updatedTrips);
  };

  const updateTripMetersDelivered = (index, metersDelivered) => {
    const updatedTrips = [...trips];
    updatedTrips[index].metersDelivered = metersDelivered;
    setTrips(updatedTrips);
  };

  const removeTrip = (index) => {
    const updatedTrips = [...trips];
    updatedTrips.splice(index, 1);
    setTrips(updatedTrips);
  };

  const toggleActivity = (tripIndex, activity) => {
    const updatedTrips = [...trips];
    const trip = updatedTrips[tripIndex];
    const activityIndex = trip.selectedActivities.findIndex((a) => a.name === activity);

    if (activityIndex !== -1) {
      trip.selectedActivities[activityIndex].count++;
    } else {
      trip.selectedActivities.push({ name: activity, count: 1 });
    }

    setTrips(updatedTrips);
  };

  const calculateActivitiesCostForTrip = (trip) => {
    let activitiesCost = 0;
    activitiesCost += deliveryCount * 12.63;
    activitiesCost += loadTrailerMinutes * 37.88;
    activitiesCost += loadTrailerDelayMinutes * 0.6313;

    if (ot1_5Checked) {
      activitiesCost *= 1.5;
    }

    if (ot2Checked) {
      activitiesCost *= 2;
    }

    if (startDayChecked) {
      const startDayRatePerMinute = 0.003148;
      activitiesCost += startDayRatePerMinute * 36;
    }

    trip.selectedActivities.forEach((activity) => {
      const selectedActivity = activities.find((a) => a.name === activity.name);
      const activityDuration = selectedActivity ? selectedActivity.duration * activity.count : 0;
      activitiesCost += activityDuration * 0.6313; // 0.6313 cents per minute

      
    });

    return activitiesCost;
  };

  const calculateTotalCost = () => {
    const totalCostPerKmLevel = {};
    const totalCostPerProduct = {};

    trips.forEach((trip) => {
      const tripCost = calculateTripCost(trip.distance);
      const productCost = trip.metersDelivered * calculateProductCost(trip.product);
      const activitiesCost = calculateActivitiesCostForTrip(trip);
      const tripTotalCost = tripCost + productCost + activitiesCost;

      // Update total cost per km level
      if (!totalCostPerKmLevel[tripCost]) {
        totalCostPerKmLevel[tripCost] = tripTotalCost;
      } else {
        totalCostPerKmLevel[tripCost] += tripTotalCost;
      }

      // Update total cost per product
      if (!totalCostPerProduct[trip.product]) {
        totalCostPerProduct[trip.product] = tripTotalCost;
      } else {
        totalCostPerProduct[trip.product] += tripTotalCost;
      }
    });

    return { totalCostPerKmLevel, totalCostPerProduct };
  };

  return (
    <div className="App">
      <div className="p-8">
        {/* Comment: This is a brief comment at the top of the React page */}
        <h1>Test Only</h1>

        {/* Trip inputs */}
        {trips.map((trip, index) => (
          <div key={index} className="block my-2">
            <label className="mr-3">Trip {index + 1}</label>
            <input
              type="number"
              value={trip.distance}
              onChange={(e) => updateTripDistance(index, e.target.value)}
            />
            <label className="mr-3">Kilometers:</label>
            <select
              value={trip.product}
              onChange={(e) => updateTripProduct(index, e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((opt, productIndex) => (
                <option key={productIndex} value={opt[0]}>
                  {opt[0]}
                </option>
              ))}
            </select>
            <label className="mr-3">Meters:</label>
            <input
              type="number"
              value={trip.metersDelivered}
              onChange={(e) => updateTripMetersDelivered(index, e.target.value)}
            />

            {/* Activity checkboxes */}
            <div>
              <label className="mr-3">Activities:</label>
              {activities.map((activity, activityIndex) => (
                <label key={activityIndex} className="mr-2">
                  <input
                    type="checkbox"
                    checked={trip.selectedActivities.some((a) => a.name === activity.name)}
                    onChange={() => toggleActivity(index, activity.name)}
                  />
                  {activity.name}
                </label>
              ))}
            </div>

            <p>KM Cost: {(calculateTripCost(trip.distance)).toFixed(2)}</p>
            <p>Meters Cost: {(trip.metersDelivered * calculateProductCost(trip.product)).toFixed(2)}</p>
            <p>Activities Cost: {calculateActivitiesCostForTrip(trip).toFixed(2)}</p>
            <p>
                Selected Activities:{' '}
              {trip.selectedActivities.map((activity) => `${activity.name} x${activity.count}`).join(', ')}
            </p>

            {/* Remove trip button */}
            <button onClick={() => removeTrip(index)}>Remove Trip</button>
          </div>
        ))}

        {/* Add trip button */}
        <button onClick={addTrip}>Add Trip</button>

        {/* Total cost */}
        <div>
          <h2>Future Use1</h2>
          {Object.entries(calculateTotalCost().totalCostPerKmLevel).map(([kmCost, totalCost]) => (
            <p key={kmCost}>
              Km Cost {kmCost}: {totalCost.toFixed(2)}
            </p>
          ))}
        </div>

        <div>
          <h2>Future Use2</h2>
          {Object.entries(calculateTotalCost().totalCostPerProduct).map(([product, totalCost]) => (
            <p key={product}>
              Product {product}: {totalCost.toFixed(2)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;