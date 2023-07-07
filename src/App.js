import React, { useState } from 'react';
import './App.css';

function App() {
  const [trips, setTrips] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [metersDelivered, setMetersDelivered] = useState(0);
  const [loadTrailerMinutes, setLoadTrailerMinutes] = useState(0);
  const [loadTrailerDelayMinutes, setLoadTrailerDelayMinutes] = useState(0);
  const [ot1_5Checked, setOT1_5Checked] = useState(false);
  const [ot2Checked, setOT2Checked] = useState(false);
  const [startDayChecked, setStartDayChecked] = useState(false);
  const [calcTotalCost, setCalcTotalCost] = useState(null);

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
    // // { name: '1.5xDay ', duration: 1 },
    // { name: '2xDay ', duration: 1 },
  ];

  const addTrip = () => {
    setTrips([...trips, { distance: '', product: '', metersDelivered: '', selectedActivities: [], ot: 1 }]);
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

  const toggleActivity = (tripIndex, activity, type) => {
    const updatedTrips = [...trips];
    const trip = updatedTrips[tripIndex];
    const activityIndex = trip.selectedActivities.findIndex((a) => a.name === activity);
    const count = activityIndex !== -1 ? trip.selectedActivities[activityIndex].count : '-1';

    if (type === 'add' && activityIndex === -1) {
      trip.selectedActivities.push({ name: activity, count: 1 });
    } else if (type === 'add' && activityIndex !== -1) {
      trip.selectedActivities[activityIndex].count++;
    } else if (activityIndex !== -1 && count >= 1) {
      trip.selectedActivities[activityIndex].count--;
    }

    setTrips(updatedTrips);
  };

  const updateOT = (tripIndex, otValue) => {
    const updatedTrips = [...trips];
    updatedTrips[tripIndex].ot = otValue;
    setTrips(updatedTrips);
  }

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
      activitiesCost += activityDuration * 0.6313 * trip.ot; // 0.6313 cents per minute

      
    });

    return activitiesCost;
  };

  const calculateTotalCost = () => {
    console.log('test');
    const totalCostPerKmLevel = [];
    const totalCostPerProduct = {};

    trips.forEach((trip) => {
      const tripCost = calculateTripCost(trip.distance);
      const productCost = trip.metersDelivered * calculateProductCost(trip.product);
      const activitiesCost = calculateActivitiesCostForTrip(trip) * trip.ot;
      const tripTotalCost = tripCost + productCost + activitiesCost;

      // Update total cost per km level
      totalCostPerKmLevel.push(tripCost + activitiesCost);
      // if (!totalCostPerKmLevel[tripCost]) {
        // totalCostPerKmLevel[tripCost] = tripTotalCost;
      // } else {
        // totalCostPerKmLevel[tripCost] += tripTotalCost;
      // }

      // Update total cost per product
      if (!totalCostPerProduct[trip.product]) {
        totalCostPerProduct[trip.product] = tripTotalCost;
      } else {
        totalCostPerProduct[trip.product] += tripTotalCost;
      }
    });

    console.log('test2', calcTotalCost);
    setCalcTotalCost({
      totalCostPerKmLevel,
      totalCostPerProduct
    });
  };

  return (
    <div className="App">
      <div className="p-4">
        {/* Comment: This is a brief comment at the top of the React page */}
        <h1 className="text-4xl mb-4 font-bold">Air Pay Checker</h1>

        {/* Trip inputs */}
        {trips.map((trip, index) => (
          <div key={index} className="block my-2">
            <h2 className="text-2xl font-bold">Trip {index+1}</h2>
            <div className="my-1 flex justify-between items-center">
              <label 
                className="block text-md font-medium text-white-900 dark:text-white"   
              >Kilometers:</label>
              <input
                className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
                type="number"
                value={trip.distance}
                onChange={(e) => updateTripDistance(index, e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="my-1 flex justify-between items-center">
              <label className="block text-md font-medium text-white-900 dark:text-white">Product: </label>
              <select
                value={trip.product}
                onChange={(e) => updateTripProduct(index, e.target.value)}
                className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
              >
                <option value="">Select Product</option>
                {products.map((opt, productIndex) => (
                  <option key={productIndex} value={opt[0]}>
                    {opt[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="my-1 flex justify-between items-center">
              <label className="block text-md font-medium text-white-900 dark:text-white">Meters Delivered:</label>
              <input
                type="number"
                value={trip.metersDelivered}
                placeholder="0"
                onChange={(e) => updateTripMetersDelivered(index, e.target.value)}
                className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
              />
            </div>
            
            {/* Activity checkboxes */}
            <div className="flex flex-wrap">
              <label className="mt-2 mb-1.5 text-xl font-bold w-full">Activities:</label>
              {activities.map((activity, activityIndex) => {
                const selectedActivity = trip.selectedActivities.find((a) => a.name === activity.name);
                const padding = activityIndex % 2 ? '' : 'pr-2';

                return (
                  <div class={"custom-number-input flex items-center w-1/2 " + padding}>
                    <label key={activityIndex} for="custom-input-number" class="w-24 h-4 mr-2 text-sm font-semibold">{activity.name}
                    </label>
                    <div class="flex flex-row h-8 rounded-lg relative bg-transparent mt-1 w-24">
                      <button onClick={() => toggleActivity(index, activity.name, 'sub')} class=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none">
                        <span class="m-auto text-2xl font-thin">−</span>
                      </button>
                      <input 
                        type="number"
                        class="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
                        name="custom-input-number"
                        value={selectedActivity ? selectedActivity.count : '0'}
                        // onChange=""
                        // value="0"
                        readOnly={true}
                      ></input>
                    <button onClick={() => toggleActivity(index, activity.name, 'add')} class="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer">
                      <span class="m-auto text-2xl font-thin">+</span>
                    </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overtime */}
            <div className="flex flex-wrap mt-2">
              <div className="w-full">
                <input 
                  className="mr-2 scale-125"
                  name={"ot" + index}
                  id={"ot0" + index}
                  type="radio"
                  value={1}
                  checked={trip.ot == 1}
                  onChange={() => updateOT(index, 1)}
                />
                <label for={"ot0" + index}>No Overtime</label>
              </div>
              <div className="w-full">
                <input 
                  className="mr-2 scale-125"
                  name={"ot" + index}
                  id={"ot1" + index}
                  type="radio"
                  value={1.5}
                  checked={trip.ot == 1.5}
                  onChange={() => updateOT(index, 1.5)}
                />
                <label for={"ot1" + index}>Overtime 1.5x</label>
              </div>
              <div className="w-full">
                <input 
                  className="mr-2 scale-125"
                  name={"ot" + index}
                  id={"ot2" + index}
                  type="radio"
                  checked={trip.ot == 2}
                  onChange={() => updateOT(index, 2)}
                />
                <label for={"ot2" + index}>Overtime 2x</label>
              </div>
            </div>

            <p className='mt-2'>
              <span className="font-bold">KM Cost:</span> {(calculateTripCost(trip.distance)).toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Meters Cost:</span> {(trip.metersDelivered * calculateProductCost(trip.product)).toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Activities Cost:</span> {calculateActivitiesCostForTrip(trip).toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Selected Activities:{' '}</span>
              {trip.selectedActivities.map((activity) => `${activity.name} x${activity.count}`).join(', ')}
            </p>

            {/* Remove trip button */}
            <button 
              onClick={() => removeTrip(index)}
              className="bg-emerald-600 text- py-1 px-3 text-lg mt-2 mb-4"  
            >Remove Trip</button>
          </div>
        ))}

        {/* Add trip button */}
        <button
          className="bg-emerald-600 text- py-1 px-3 text-lg"
          onClick={addTrip}
        >Add Trip</button>

        {/* Total cost */}
        <button 
          onClick={() => calculateTotalCost()}
          className="bg-emerald-600 block py-1 px-3 text-lg my-2"
        >Calculate Totals</button>
        
        {calcTotalCost && (
          <div>
            <h2>Total cost for distance and activities: </h2>
            {calcTotalCost.totalCostPerKmLevel.map((item, idx) => {
              <p key={idx}>test</p>
            })}
            {calcTotalCost.totalCostPerKmLevel.map((item, idx) => {
              <p key={idx}>
                <span className="font-bold">Trip {idx+1}: </span> {item.toFixed(2)}
              </p> 
            })}

            <h2>Total cost per product: </h2>
            {Object.entries(calcTotalCost.totalCostPerProduct).map((product, totalCost) => {
              <p key={product}>
                <span className="font-bold">{product}: </span> {totalCost.toFixed(2)}
              </p> 
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;