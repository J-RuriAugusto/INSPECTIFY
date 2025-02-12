from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

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
    homeowner_id = db.Column(db.String(50), db.ForeignKey('homeowner.homeowner_id'), nullable=False)
    homeName = db.Column(db.String(100), primary_key=True)
    material = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Float, nullable=False)
    is_default = db.Column(db.Boolean, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def __init__(self, homeowner_id, homeName, material, age, height, is_default, latitude=None, longitude=None):
        self.homeowner_id = homeowner_id
        self.homeName = homeName
        self.material = material
        self.age = age
        self.height = height
        self.is_default = is_default
        self.latitude = latitude
        self.longitude = longitude


class HomeSchema(ma.Schema):
    class Meta:
        fields = ('homeowner_id', 'homeName', 'material', 'age', 'height', 'is_default', 'latitude', 'longitude')  # Include new fields


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
    homeowner_id = request.json['homeowner_id']
    homeName = request.json['homeName']
    material = request.json['material']
    age = request.json['age']
    height = request.json['height']
    latitude = request.json.get('latitude')
    longitude = request.json.get('longitude')

    # Set all existing homes of the homeowner to non-default
    Home.query.filter_by(homeowner_id=homeowner_id).update({"is_default": False})

    # Insert the new home as the default one
    new_home = Home(homeowner_id, homeName, material, age, height, True, latitude, longitude)
    db.session.add(new_home)
    db.session.commit()

    return home_schema.jsonify(new_home)


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
