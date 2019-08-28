/* Dependencies */
var express = require('express'),
    router = express.Router(),
    Dog = require("../models/dogModel.js");

router.get("/:id", function(req, res) {
    return res.status(200).json(req.dog);
});

router.get("/", function(req, res){
    let query = {};
    if(req.query){
        query = req.query;
    }
    Dog.find(query, function(err, dogs){
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(dogs);
    });
});

router.delete("/:id", function(req, res) {
    Dog.findByIdAndRemove(req.params.id, function(err, dog){
        if(err){
            return res.status(500).send(err);
        }

        const response = {
            message: "Dog successfully deleted!",
            id: dog._id
        };

        return res.status(200).json(response);
    });
});

router.post("/", function(req, res){
    const newDog = new Dog(req.body);
    newDog.save(function(err){
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(newDog);
    });
});

router.patch("/:id", function(req, res){
    let dog = req.dog;
    if(req.body.weight){
        dog.weight = req.body.weight;
    }
    if(req.body.address){
        dog.address = req.body.address;
    }
    dog.save(function(err){
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(dog);
    });
});

router.param('id', function (req, res, next, id) {
    Dog.findById(id, function (err, dog) {
        if (err) {
            return res.status(400).send(err);
        } else {
            req.dog = dog;
            next();
        }
    });
});

module.exports = router;