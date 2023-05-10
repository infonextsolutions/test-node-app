const express = require("express");
const app = express();
const multer = require("multer");
const axios = require("axios").default;
const fs = require("fs");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const PORT = 5000;

const base_url = "https://arorarealtech.com/jsonapi/node/property";
const username = "api";
const password = "api";

async function uploadData(req, res) {
  try {
    const { body, file } = req;

    console.log(">>>", body);
    console.log("file", file);

    // const { error } = propUploadValidation(body);
    // if (error) return res.status(400).send(error.details[0]);

    if (!file) {
      return res.status(400).send({ message: "image is required." });
    }
    console.log("Step 1>>>>>");

    // return res.send();
    uploadFile(req, res);
  } catch (error) {
    console.log(22, error);
    return res.status(500).send(error);
  }
}

const uploadFile = async (req, res) => {
  try {
    const name = req.file.originalname;
    const content = `Content-Disposition: file; filename="${name}"`;
    const url = `${base_url}/field_test`;
    // const filename = req.file.path;
    const filename = path.resolve(`${req.file.path}`);
    const data = fs.readFileSync(filename);

    const config = {
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: "Basic YXBpOmFwaQ==",
        Accept: "application/vnd.api+json",
        "Content-Disposition": `file; filename="${name}"`,
      },
      auth: {
        username: username,
        password: password,
      },
    };

    axios
      .post(url, data, config)
      .then((response) => {
        const uuid = response.data.data.id;

        // const taxonomy = getTaxonomy(req.body.field_tags);
        const taxonomy = getTaxonomy("Plots");

        const postData = {
          data: {
            type: "node--property",
            attributes: {
              field_description: req.body.description,
              field_email: req.body.email,
              field_location: req.body.city,
              field_dealers_name: "Arun Arora",
              title: req.body.title,
              field_property_code: "",
              field_contact_number: req.body.phoneNumber,
            },
            relationships: {
              field_test: {
                data: {
                  type: "file--file",
                  id: uuid,
                },
                attributes: {
                  alt: `Arorarealtech - ${name}`,
                },
              },
              field_tags: {
                data: {
                  type: "taxonomy_term--tags",
                  id: `${taxonomy}`,
                },
              },
            },
          },
        };
        const config2 = {
          headers: {
            "Content-Type": "application/vnd.api+json",
            Authorization: "Basic YXBpOmFwaQ==",
            Accept: "application/vnd.api+json",
          },
          auth: {
            username: username,
            password: password,
          },
        };
        axios
          .post(base_url, postData, config2)
          .then((response) => {
            const uuid_node = response.data.data.id;
            if (uuid_node) {
              return res.send({
                message: "Record has been uploaded to the website",
              });
            } else {
              return res
                .status(500)
                .send({ message: "An error occured, please try again" });
            }
          })
          .catch((error) => {
            console.error(error);
            return res
              .status(500)
              .send({ message: "An error occured, please try again" });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error);
        // res.send("An error occured, please try again");
      });
  } catch (error) {
    console.log("check axios err", error);
    return res.status(500).send(error);
  }
};

function getTaxonomy(taxonomy) {
  switch (taxonomy) {
    case "Plots":
      return "e924679c-37d6-49e8-a18f-372f8b21309a";
    case "Agricultural":
      return "9a788ea8-0068-41e5-bc24-c4858de27a6f";
    case "Commercial":
      return "92c56f12-60a2-4766-bb1c-624c6322f4cb";
    case "Industrial":
      return "363ff405-aead-47ce-bbe1-240cd5a0e3e2";
    case "Rented":
      return "698245a1-94e5-4aaa-9689-d7890e51ae48";
    case "Institutional":
      return "1092e3bf-f167-4d24-84f5-c8c4ca5ac346";
    case "Residential":
      return "54bf89c7-95de-447d-a1d3-47ba5c031f0a";
    default:
      return "e924679c-37d6-49e8-a18f-372f8b21309a";
  }
}

app.post("/uploadProperty", upload.single("file"), uploadData);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(PORT, () =>
  console.log(`Server running at port ${PORT}`)
);
