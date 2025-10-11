import React, { useState } from 'react';
import './App.css';

function App() {
  const [trips, setTrips] = useState([]);
  const [deliveryCount] = useState(0);
  const [loadTrailerMinutes] = useState(0);
  const [loadTrailerDelayMinutes] = useState(0);
  const [ot1_5Checked] = useState(false);
  const [ot2Checked] = useState(false);
  const [startDayChecked] = useState(false);
  const [calcTotalCost, setCalcTotalCost] = useState(null);

	const calculateDistanceRate = (distance) => {
    if (distance <= 160) {
      return 0.7064;
    } else if (distance <= 360) {
      return 0.6646;
    } else if (distance <= 1000) {
      return 0.6027;
    } else {
      return 0.54;
    }
  };

  const calculateProductCost = (product) => {
    if (product === 'Argon') {
      return 0.004996;
    } else if (product === 'CO2') {
      return 0.003413;
    } else if (product === 'Oxygen' || product === 'Nitrogen') {
      return 0.00388;
    } else if (product === 'N2o') {
      return 0.003466;
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
    { name: 'PupTrctr ', duration: 10 },
    { name: 'PupTrlr ', duration: 15 },
    { name: 'PupCylTrlr ', duration: 25 },
    { name: 'DelayMin ', duration: 1 },
    { name: 'DelayMin10 ', duration: 10 },
    // { name: '1.5xDay ', duration: 1 },
    // { name: '2xDay ', duration: 1 },
  ];

  const [activityCounts, setActivityCounts] = useState(() => {
    const initialCounts = {};
    activities.forEach((activity) => {
      initialCounts[activity.name] = 0;
    });
    return initialCounts;
  });

  const addTrip = () => {
    setTrips([
      ...trips,
      {
        distance: '',
        product: '',
        metersDelivered: '',
      },
    ]);
  };

  const updateTripDistance = (index, distance) => {
    const updatedTrips = [...trips];
    updatedTrips[index].distance = distance === '' ? '' : Number(distance);
    setTrips(updatedTrips);
  };

  const updateTripProduct = (index, product) => {
    const updatedTrips = [...trips];
    updatedTrips[index].product = product;
    setTrips(updatedTrips);
  };

  const updateTripMetersDelivered = (index, metersDelivered) => {
    const updatedTrips = [...trips];
    updatedTrips[index].metersDelivered =
      metersDelivered === '' ? '' : Number(metersDelivered);
    setTrips(updatedTrips);
  };

  const removeTrip = (index) => {
    const updatedTrips = [...trips];
    updatedTrips.splice(index, 1);
    setTrips(updatedTrips);
  };

  const handleActivityCountChange = (activityName, type) => {
    setActivityCounts((prevCounts) => {
      const updatedCounts = { ...prevCounts };
      const currentValue = updatedCounts[activityName] || 0;

      if (type === 'add') {
        updatedCounts[activityName] = currentValue + 1;
      } else if (type === 'sub' && currentValue > 0) {
        updatedCounts[activityName] = currentValue - 1;
      }

      return updatedCounts;
    });
  };

  const calculateGlobalActivitiesCost = () => {
    const perMinuteRate = 0.6803;
    let activitiesCost = 0;

    activitiesCost += deliveryCount * 13.61;
    activitiesCost += loadTrailerMinutes * 40.82;
    activitiesCost += loadTrailerDelayMinutes * perMinuteRate;

    const overtimeMultiplier =
      (ot1_5Checked ? 1.5 : 1) * (ot2Checked ? 2 : 1);

    const activityMinutesCost = Object.entries(activityCounts).reduce(
      (total, [activityName, count]) => {
        if (count <= 0) return total;
        const matchingActivity = activities.find(
          (activity) => activity.name === activityName
        );
        const activityDuration = matchingActivity
          ? matchingActivity.duration * count
          : 0;
        return total + activityDuration * perMinuteRate;
      },
      0
    );

    activitiesCost = (activitiesCost + activityMinutesCost) * overtimeMultiplier;

    if (startDayChecked) {
      activitiesCost += perMinuteRate * 36;
    }

    return activitiesCost;
  };

  const calculateTotalCost = () => {
    const tripKms = {};
    const totalCostPerProduct = {};
    const totalActivityCost = calculateGlobalActivitiesCost();

    trips.forEach((trip) => {
      const distance = Number(trip.distance);
      const productCost =
        trip.metersDelivered * calculateProductCost(trip.product);
      const distRate = calculateDistanceRate(distance);

      if (distance !== 0) {
        if (!tripKms[distRate]) {
          tripKms[distRate] = {
            distance: distance,
            cost: distRate * distance,
          };
        } else {
          tripKms[distRate].distance += distance;
          tripKms[distRate].cost += distRate * distance;
        }
      }

      if (trip.product !== '') {
        // Update total cost per product
        if (!totalCostPerProduct[trip.product]) {
          totalCostPerProduct[trip.product] = Number(productCost.toFixed(2));
        } else {
          totalCostPerProduct[trip.product] += Number(productCost.toFixed(2));
        }
      }
    });

    setCalcTotalCost({
      tripKms,
      totalCostPerProduct,
      totalActivityCost,
    });
  };

  const tripsBaseCost = trips.reduce((acc, trip) => {
    const kmCost = trip.distance * calculateDistanceRate(trip.distance);
    const meterCost = trip.metersDelivered * calculateProductCost(trip.product);
    return acc + kmCost + meterCost;
  }, 0);

  const totalTripsCost = tripsBaseCost + calculateGlobalActivitiesCost();

  return (
    <div className="App">
      <div className="p-4">
        <div className="hide-from-print">
          <h1 className="text-4xl mb-4 font-bold">
            ALC Pay Calculator 10/23 rates
          </h1>

          {/* Trip inputs */}
          {trips.map((trip, index) => {
            const kmCost =
              trip.distance * calculateDistanceRate(trip.distance);
            const meterCost =
              trip.metersDelivered * calculateProductCost(trip.product);
            const totalCost = kmCost + meterCost;

            return (
              <div key={index} className="block my-2">
                <h2 className="text-2xl font-bold">Trip {index + 1}</h2>
                <div className="my-1 flex justify-between items-center">
                  <label className="block text-md font-medium text-white-900 dark:text-white">
                    Kilometers:
                  </label>
                  <input
                    className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
                    type="number"
                    value={trip.distance}
                    onChange={(e) => updateTripDistance(index, e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="my-1 flex justify-between items-center">
                  <label className="block text-md font-medium text-white-900 dark:text-white">
                    Product:{' '}
                  </label>
                  <select
                    value={trip.product}
                    onChange={(e) => updateTripProduct(index, e.target.value)}
                    className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
                  >
                    <option value="">Select Product</option>
                    {products.map((opt, productIndex) => (
                      <option key={opt[0]} value={opt[0]}>
                        {opt[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="my-1 flex justify-between items-center">
                  <label className="block text-md font-medium text-white-900 dark:text-white">
                    Meters Delivered:
                  </label>
                  <input
                    type="number"
                    value={trip.metersDelivered}
                    placeholder="0"
                    onChange={(e) =>
                      updateTripMetersDelivered(index, e.target.value)
                    }
                    className="border text-sm rounded-lg focus:ring-blue-500 block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white dark:focus:ring-blue-500 focus:border-blue-500 w-40"
                  />
                </div>

                <p className="mt-2">
                  <span className="font-bold">KM Cost:</span>{' '}
                  {kmCost.toFixed(2)}
                </p>
                <p>
                  <span className="font-bold">Meters Cost:</span>{' '}
                  {meterCost.toFixed(2)}
                </p>
                <p>
                  <span className="font-bold">Trip Total:</span>{' '}
                  {totalCost.toFixed(2)}
                </p>

                {/* Remove trip button */}
                <button
                  onClick={() => removeTrip(index)}
                  className="bg-orange-600 text- py-1 px-3 text-lg mt-2 mb-4"
                >
                  Remove Trip
                </button>
              </div>
            );
          })}

          {/* Add trip button */}
          <button
            className="bg-emerald-600 text- py-1 px-3 text-lg"
            onClick={addTrip}
          >
            Add Trip
          </button>

          {/* Global activity selector */}
          <div className="mt-4">
            <label className="mt-6 mb-1.5 text-xl font-bold block">
              Activities:
            </label>
            <div className="flex flex-wrap">
              {activities.map((activity, activityIndex) => {
                const padding = activityIndex % 2 ? '' : 'pr-2';
                const activityCount = activityCounts[activity.name] || 0;

                return (
                  <div
                    className={
                      'custom-number-input flex items-center w-1/2 ' + padding
                    }
                    key={activity.name}
                  >
                    <label
                      key={activityIndex}
                      htmlFor={`activity-${activityIndex}`}
                      className="w-24 h-4 mr-2 text-sm font-semibold"
                    >
                      {activity.name}
                    </label>
                    <div className="flex flex-row h-8 rounded-lg relative bg-transparent mt-1 w-24">
                      <button
                        onClick={() =>
                          handleActivityCountChange(activity.name, 'sub')
                        }
                        className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                      >
                        <span className="m-auto text-2xl font-thin">−</span>
                      </button>
                      <input
                        id={`activity-${activityIndex}`}
                        type="number"
                        className="rounded-none outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-basecursor-default flex items-center text-gray-700"
                        value={activityCount}
                        readOnly={true}
                      />
                      <button
                        onClick={() =>
                          handleActivityCountChange(activity.name, 'add')
                        }
                        className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                      >
                        <span className="m-auto text-2xl font-thin">+</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2">
              <span className="font-bold">Selected Activities: </span>
              {Object.entries(activityCounts)
                .filter(([, count]) => count > 0)
                .map(([name, count]) => `${name} x${count}`)
                .join(', ') || 'None'}
            </p>
          </div>

          {/* Total cost */}
          <button
            onClick={() => calculateTotalCost()}
            className="bg-emerald-600 block py-1 px-3 text-lg my-2"
          >
            Calculate Totals
          </button>
        </div>
        <React.Fragment>
          {calcTotalCost && (
            <div>
              {Object.entries(calcTotalCost.tripKms).map((kms, idx) => {
                return (
                  <p key={kms[0]}>
                    <span className="font-bold">
                      Driver {kms[1].distance} km @ {kms[0]}:{' '}
                    </span>{' '}
                    {kms[1].cost.toFixed(2)}
                  </p>
                );
              })}

              {Object.entries(calcTotalCost.totalCostPerProduct).map(
                (product, idx) => {
                  const rate = calculateProductCost(product[0]);

                  if (product.length < 2) return <></>;
                  return (
                    <p key={idx}>
                      <span className="font-bold">
                        Pumped {product[0]} @ {rate}:{' '}
                      </span>{' '}
                      {Number(product[1]).toFixed(2)}
                    </p>
                  );
                }
              )}

              {calcTotalCost.totalActivityCost !== 0 && (
                <p>
                  <span className="font-bold">Activity Minutes: </span>
                  {calcTotalCost.totalActivityCost.toFixed(2)}
                </p>
              )}

              <p className="font-bold mt-2">
                Total:
                <span className="border-emerald-600 p-1 ml-1 border-b-2">
                  {totalTripsCost.toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </React.Fragment>
      </div>
      <footer className="mt-4 mb-4 pt-3 border-t border-gray-600 text-center text-xs text-gray-400">
        <span>— ALC {new Date().getFullYear()} —</span>
      </footer>
    </div>
  );
}


export default App;
