const fs = require("fs");
// const http = require("http")
const express = require("express");
const { error } = require("console");

const app = express();

// middleware untuk membaca json dari request body(client, FE dll) ke kita
app.use(express.json());

// default URL = Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Application is running good...",
  });
});

// kalau HTTP module kan if(req.url === / "Tegar") {}
app.get("/tegar", (req, res) => {
  res.status(200).json({
    message: "Ping Successfully !",
  });
});

const cars = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/data/cars.json`, "utf-8")
);

// /api/v1/(collection nya) => collection nya ini harus JAMAK (s)
app.get("/api/v1/cars", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Success get cars data",
    isSuccess: true,
    totalData: cars.length,
    data: {
      cars,
    },
  });
});

// response.data.cars

app.post("/api/v1/cars", (req, res) => {
  // insert into ......
  const newCar = req.body;

  cars.push(newCar);

  fs.writeFile(
    `${__dirname}/assets/data/cars.json`,
    JSON.stringify(cars),
    (err) => {
      res.status(201).json({
        status: "Success",
        message: "Success add new car data",
        isSuccess: true,
        data: {
          car: newCar,
        },
      });
    }
  );
});

app.get("/api/v1/cars/:id", (req, res) => {
  // select * from fsw2 where id="1" OR NAME = "Yogi"
  const id = req.params.id;
  console.log(id);

  //  == equal tanpa memedulikan tipe data, === memedulikan tipe data
  const car = cars.find((i) => i.id === id);

  // salah satu basic error handling,
  if (!car) {
    console.log("ga ada data");
    return res.status(404).json({
      status: "Failed",
      message: `Failed get data this id: ${id}`,
      isSuccess: false,
      data: null,
    });
  }

  res.status(200).json({
    status: "Success",
    message: "Success get car data",
    isSuccess: true,
    data: {
      car: car,
    },
  });
});

app.patch("/api/v1/cars/:id", (req, res) => {
  console.log("PATCH request received");
  const id = req.params.id; // Convert id to number
  const { name, year, type } = req.body;

  const car = cars.find((i) => i.id === id);
  if (!car) {
    return res.status(404).json({
      status: "Failed",
      message: "Car not found!",
      isSuccess: false,
    });
  }

  const carIndex = cars.findIndex((car) => car.id === id);

  // Update the car data using the spread operator
  cars[carIndex] = { ...cars[carIndex], ...req.body };

  fs.writeFile(
    `${__dirname}/assets/data/cars.json`,
    JSON.stringify(cars, null, 2), // Pretty print JSON
    (err) => {
      if (err) {
        console.error("Error writing file:", err); // Log the error
        return res.status(500).json({
          status: "Error",
          message: "Failed to save car data!",
          isSuccess: false,
        });
      }

      res.status(200).json({
        status: "Success",
        message: "Car data updated successfully!",
        isSuccess: true,
        data: {
          car: cars[carIndex],
        },
      });
    }
  );
});

app.put("api/v1/cars/:id", (req, res) => {
  const id = req.params.id * 1; // Convert id to number
  const { name, year, type } = req.body;

  const car = cars.find((i) => i.id === id);
  if (!car) {
    return res.status(404).json({
      status: "Failed",
      message: "Car not found!",
      isSuccess: false,
    });
  }

  // Ensure that all fields are present
  if (!name || !year || !type) {
    return res.status(400).json({
      status: "Failed",
      message: "Missing required fields!",
      isSuccess: false,
    });
  }

  // Replace the entire car with the new data
  const updatedCar = { id, name, year, type };
  const carIndex = cars.findIndex((car) => car.id === id);
  cars[carIndex] = updatedCar;

  fs.writeFile(
    `${__dirname}/assets/data/cars.json`,
    JSON.stringify(cars, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: "Failed to save car data!",
          isSuccess: false,
        });
      }

      res.status(200).json({
        status: "Success",
        message: "Car data replaced successfully!",
        isSuccess: true,
        data: {
          car: cars[carIndex],
        },
      });
    }
  );
});

app.delete("/api/v1/cars/:id", (req, res) => {
  const id = req.params.id ; // Convert id to number
  const car = cars.find((i) => i.id === id);

  if (!car) {
    return res.status(404).json({
      status: "Failed",
      message: "Car not found!",
      isSuccess: false,
    });
  }

  const carIndex = cars.findIndex((car) => car.id === id);

  // Use splice to remove the car from the array
  cars.splice(carIndex, 1); // Remove 1 car from the index

  // Optionally write to the file if you are persisting the data
  fs.writeFile(
    `${__dirname}/assets/data/cars.json`,
    JSON.stringify(cars, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: "Error",
          message: "Failed to delete car data!",
          isSuccess: false,
        });
      }

      res.status(204).json({
        status: "Success",
        message: "Car deleted successfully!",
        isSuccess: true,
        data: null, // No content for successful deletion
      });
    }
  );
});

// middleware / handler untuk url yang tidak dapat diakses karena memang tidak ada di aplikasi
// membuat middleware = our own middleware
app.use((req, res, next) => {
  res.status(404).json({
    status: "Failed",
    message: "API not exist !!!",
  });
});

app.listen("8000", () => {
  console.log("start aplikasi kita di port 8000");
});
