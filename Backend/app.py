from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/inspectify'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

# Homeowners Table
class Homeowner(db.Model):
    homeowner_id = db.Column(db.String(50), primary_key=True)

    def __init__(self, homeowner_id):
        self.homeowner_id = homeowner_id

class HomeownerSchema(ma.Schema):
    class Meta:
        fields = ('homeowner_id',)

homeowner_schema = HomeownerSchema()
homeowners_schema = HomeownerSchema(many=True)

# Homes Table
class Home(db.Model):
    home_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    homeowner_id = db.Column(db.String(50), db.ForeignKey('homeowner.homeowner_id'), nullable=False)
    homeName = db.Column(db.String(100), nullable=False)
    houseAge = db.Column(db.Integer, nullable=True)
    houseUse = db.Column(db.String(100), nullable=True)
    renovations = db.Column(db.Text, nullable=True)
    typeOfHouse = db.Column(db.String(100), nullable=True)
    numFloor = db.Column(db.Integer, nullable=True)
    lotArea = db.Column(db.Float, nullable=True)
    floorArea = db.Column(db.Float, nullable=True)
    selectedHouseType = db.Column(db.String(100), nullable=True)
    selectedMaterial = db.Column(db.String(100), nullable=True)
    selectedFlooring = db.Column(db.String(100), nullable=True)
    selectedWall = db.Column(db.String(100), nullable=True)
    selectedCeiling = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    dateCreated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # New field

    def __init__(self, homeowner_id, homeName, is_default, houseAge=None, houseUse=None, renovations=None, typeOfHouse=None,
                 numFloor=None, lotArea=None, floorArea=None, selectedHouseType=None, selectedMaterial=None,
                 selectedFlooring=None, selectedWall=None, selectedCeiling=None, latitude=None, longitude=None):
        self.homeowner_id = homeowner_id
        self.homeName = homeName
        self.houseAge = houseAge
        self.houseUse = houseUse
        self.renovations = renovations
        self.typeOfHouse = typeOfHouse
        self.numFloor = numFloor
        self.lotArea = lotArea
        self.floorArea = floorArea
        self.selectedHouseType = selectedHouseType
        self.selectedMaterial = selectedMaterial
        self.selectedFlooring = selectedFlooring
        self.selectedWall = selectedWall
        self.selectedCeiling = selectedCeiling
        self.latitude = latitude
        self.longitude = longitude
        self.is_default = is_default
        self.dateCreated = datetime.utcnow()  # Ensure the field is set in the constructor

class HomeSchema(ma.Schema):
    class Meta:
        fields = ('home_ID', 'homeowner_id', 'homeName', 'houseAge', 'houseUse', 'renovations', 'typeOfHouse', 'numFloor',
                  'lotArea', 'floorArea', 'selectedHouseType', 'selectedMaterial', 'selectedFlooring', 'selectedWall',
                  'selectedCeiling', 'latitude', 'longitude', 'is_default', 'dateCreated')  # Add dateCreated field


home_schema = HomeSchema()
homes_schema = HomeSchema(many=True)

# Routes for Homeowners
@app.route('/homeowners', methods=['GET'])
def get_homeowners():
    all_homeowners = Homeowner.query.all()
    return jsonify(homeowners_schema.dump(all_homeowners))

@app.route('/homeowners/<homeowner_id>', methods=['GET'])
def get_homeowner(homeowner_id):
    homeowner = Homeowner.query.get(homeowner_id)
    return homeowner_schema.jsonify(homeowner)

@app.route('/homeowners', methods=['POST'])
def add_homeowner():
    homeowner_id = request.json['homeowner_id']

    new_homeowner = Homeowner(homeowner_id)
    db.session.add(new_homeowner)
    db.session.commit()
    return homeowner_schema.jsonify(new_homeowner)

# Routes for Homes
@app.route('/homes', methods=['GET'])
def get_homes():
    all_homes = Home.query.all()
    return jsonify(homes_schema.dump(all_homes))


@app.route('/homes/<homeowner_id>', methods=['GET'])
def get_homes_by_homeowner(homeowner_id):
    homes = Home.query.filter_by(homeowner_id=homeowner_id).all()
    return jsonify(homes_schema.dump(homes))


@app.route('/homes', methods=['POST'])
def add_home():
    try:
        data = request.json
        homeowner_id = data['homeowner_id']
        homeName = data['homeName']
        houseAge = int(data['houseAge']) if data['houseAge'] is not None else None
        houseUse = data['houseUse']
        renovations = data.get('renovations', None)
        typeOfHouse = data['typeOfHouse']
        numFloor = int(data['numFloor']) if data['numFloor'] is not None else None
        lotArea = float(data['lotArea']) if data['lotArea'] is not None else None
        floorArea = float(data['floorArea']) if data['floorArea'] is not None else None
        selectedHouseType = data['selectedHouseType']
        selectedMaterial = data['selectedMaterial']
        selectedFlooring = data['selectedFlooring']
        selectedWall = data['selectedWall']
        selectedCeiling = data['selectedCeiling']
        latitude = float(data.get('latitude', 0)) if data.get('latitude') is not None else None
        longitude = float(data.get('longitude', 0)) if data.get('longitude') is not None else None
        is_default = data.get('is_default', False)

        # Set all existing homes of the homeowner to non-default if the new home is default
        if is_default:
            Home.query.filter_by(homeowner_id=homeowner_id).update({"is_default": False})

        new_home = Home(
            homeowner_id=homeowner_id,
            homeName=homeName,
            houseAge=houseAge,
            houseUse=houseUse,
            renovations=renovations,
            typeOfHouse=typeOfHouse,
            numFloor=numFloor,
            lotArea=lotArea,
            floorArea=floorArea,
            selectedHouseType=selectedHouseType,
            selectedMaterial=selectedMaterial,
            selectedFlooring=selectedFlooring,
            selectedWall=selectedWall,
            selectedCeiling=selectedCeiling,
            latitude=latitude,
            longitude=longitude,
            is_default=is_default
        )

        db.session.add(new_home)
        db.session.commit()

        return home_schema.jsonify(new_home)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/homeowners/<homeowner_id>/default_home', methods=['GET'])
def get_default_home(homeowner_id):
    default_home = Home.query.filter_by(homeowner_id=homeowner_id, is_default=True).first()
    if default_home:
        return jsonify({
            'homeName': default_home.homeName,
            'latitude': default_home.latitude,
            'longitude': default_home.longitude
        })
    else:
        return jsonify({'message': 'No default home found'}), 404


if __name__ == "__main__":
    app.run(host='172.16.0.137', port=5000, debug=True)
