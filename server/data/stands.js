// Mock data for taxi stands
// In a real app, this would come from a database

const stands = [
  {
    id: "stand_1",
    name: "Merkez Meydan Taksi",
    location: {
      lat: 41.0082,
      lng: 28.9784, // Near Hagia Sophia, Istanbul
      address: "Sultan Ahmet, Ayasofya Meydanı, 34122 Fatih/İstanbul"
    }
  },
  {
    id: "stand_2",
    name: "Beşiktaş İskele Taksi",
    location: {
      lat: 41.0422,
      lng: 29.0060, // Beşiktaş Ferry Pier
      address: "Sinanpaşa, Beşiktaş Cad., 34353 Beşiktaş/İstanbul"
    }
  },
  {
    id: "stand_3",
    name: "Kadıköy Boğa Taksi",
    location: {
      lat: 40.9904,
      lng: 29.0292, // Bull Statue, Kadıköy
      address: "Altıyol Meydanı, Söğütlüçeşme Cd, 34714 Kadıköy/İstanbul"
    }
  }
];

module.exports = stands;
