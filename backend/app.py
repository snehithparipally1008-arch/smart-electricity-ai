from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)

CORS(app)

# Load trained model and encoder
model = joblib.load('electricity_model.pkl')
encoder = joblib.load('city_encoder.pkl')


@app.route('/')
def home():
    return "Backend is running successfully!"


@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    # User Inputs
    Fan = data['Fan']
    Refrigerator = data['Refrigerator']
    AirConditioner = data['AirConditioner']
    Television = data['Television']
    Monitor = data['Monitor']
    MotorPump = data['MotorPump']
    Month = data['Month']
    City = data['City']
    CurrentMonthUnits = data['CurrentMonthUnits']

    # Automatic tariff mapping
    city_tariff = {
        "Mumbai": 9.2,
        "Hyderabad": 8.4,
        "Delhi": 7.8,
        "Bangalore": 8.8,
        "Chennai": 7.5
    }

    TariffRate = city_tariff.get(City, 8.0)

    # Encode city
    encoded_city = encoder.transform(
        pd.DataFrame({'City': [City]})
    )['City'][0]

    # Feature Engineering

    ac_monthly_units = (
        AirConditioner * 1.5 * 8 * 30
    )

    fan_monthly_units = (
        Fan * 0.075 * 18 * 30
    )

    tv_monthly_units = (
        Television * 0.1 * 6 * 30
    )

    fridge_monthly_units = (
        Refrigerator * 0.15 * 24 * 30
    )

    estimated_units = (
        ac_monthly_units +
        fan_monthly_units +
        tv_monthly_units +
        fridge_monthly_units
    )

    ac_x_tariff = (
        AirConditioner * TariffRate
    )

    total_appliances = (
        Fan +
        AirConditioner +
        Television +
        Refrigerator
    )

    appliance_x_tariff = (
        total_appliances * TariffRate
    )

    is_summer = (
        1 if Month in [3, 4, 5, 6]
        else 0
    )

    is_winter = (
        1 if Month in [11, 12, 1, 2]
        else 0
    )

    # Create dataframe for prediction

    features = pd.DataFrame([{
        'Fan': Fan,
        'Refrigerator': Refrigerator,
        'AirConditioner': AirConditioner,
        'Television': Television,
        'Monitor': Monitor,
        'MotorPump': MotorPump,
        'Month': Month,
        'City': encoded_city,
        'TariffRate': TariffRate,
        'ac_monthly_units': ac_monthly_units,
        'fan_monthly_units': fan_monthly_units,
        'tv_monthly_units': tv_monthly_units,
        'fridge_monthly_units': fridge_monthly_units,
        'estimated_units': estimated_units,
        'ac_x_tariff': ac_x_tariff,
        'total_appliances': total_appliances,
        'appliance_x_tariff': appliance_x_tariff,
        'is_summer': is_summer,
        'is_winter': is_winter,
        'CurrentMonthUnits': CurrentMonthUnits
    }])

    # Model prediction
    prediction = model.predict(features)[0]

    # Predicted bill
    predicted_bill = (
        prediction * TariffRate
    )

    # Smart Recommendations

    recommendations = []

    if AirConditioner >= 2:
        recommendations.append(
            "Air conditioner usage is contributing significantly to electricity consumption."
        )

    if Fan >= 8:
        recommendations.append(
            "Large number of fans detected. Consider energy-efficient fan models."
        )

    if prediction >= 300:
        recommendations.append(
            "Your predicted electricity usage is moderately high."
        )

    if prediction >= 500:
        recommendations.append(
            "Electricity consumption is very high. Monitor appliance usage carefully."
        )

    if total_appliances >= 10:
        recommendations.append(
            "High appliance count detected. Try reducing simultaneous appliance usage."
        )

    if Month in [3, 4, 5, 6]:
        recommendations.append(
            "Summer season may increase cooling-related electricity consumption."
        )

    if CurrentMonthUnits > 400:
        recommendations.append(
            "Current month units are already high compared to average households."
        )

    if Refrigerator >= 2:
        recommendations.append(
            "Multiple refrigerators increase continuous power consumption."
        )

    if MotorPump >= 1:
        recommendations.append(
            "Motor pump usage may significantly affect monthly electricity usage."
        )

    if len(recommendations) == 0:
        recommendations.append(
            "Electricity usage appears normal and efficient."
        )

    # Return response
    return jsonify({
        'predicted_units': round(float(prediction), 2),
        'predicted_bill': round(float(predicted_bill), 2),
        'recommendations': recommendations
    })


if __name__ == '__main__':
    app.run(debug=True)