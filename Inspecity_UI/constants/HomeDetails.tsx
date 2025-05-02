const HomeDetails = {
    homeId: '',
    latitude: 0,
    longitude: 0,
    setHomeLocation: (lat: number, long: number) => {
      HomeDetails.latitude = lat;
      HomeDetails.longitude = long;
    },
    setHomeId: (id: string) => {
      HomeDetails.homeId = id;
    }
  };
  
  export default HomeDetails;
  