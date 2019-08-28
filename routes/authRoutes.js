var express = require('express'),
    User = require('../models/userModel.js'),
    Dog = require('../models/dogModel.js'),
    router = express.Router();

function getUser(username) {
    return new Promise((resolve, reject) => {
        User.findOne({username}, function(err, doc){
            if(err){
                reject(err);
            }
            else{
                resolve(doc);
            }
        });
    });
}

router.post("/authorize", async (req, res) => {

    try {
        const user = await getUser(req.body.username);
        if (!user) {
            return res.status(400).send("The following username entered does not exist in the DB: " + req.body.username);
        }

        if(user.password === req.body.password){
            req.session = {
                user: user
            };
            if(user.isAdmin)
                return res.status(200).send("Admin Login!");
            return res.status(201).send("User Login!");
        }
    
        return res.status(401).send("UNAUTHORIZED ACCESS: Incorrect password for username " + req.body.username + "!!!");
    
    } catch (error) {
        return res.status(500).send("Internal Server Error occured while trying to query MongoDB!");
    }


});

router.delete("/logout", async (req, res) => {

    try {
        req.session.reset();
        res.status(200).send('logged out!');

    } catch (error) {
        return res.status(500).send("Internal Server Error Occured!");
    }
});

router.get("/dogs", async function(req, res){
    if(!req.session || !req.session.user){
        return res.status(400).send("No User in Session!");
    }

    let user = req.session.user;
    user = await getUser(user.username);
    let result = [];
    let dogs = [];

    if(Array.isArray(user.dogsOwned)){
        dogs = user.dogsOwned;
    }

    dogs.forEach(function(dogId, idx, arr){
        Dog.findById(dogId, function (err, dog) {
            if (!err) {
                result.push(dog);;
            }
            if(idx + 1 == arr.length){
                return res.status(200).json(result);
            }
        });
    });

});

router.patch("/dogs/add/:id", async function(req, res){
    if(!req.session || !req.session.user){
        return res.status(400).send("No User in Session!");
    }

    let user = req.session.user;
    user = await getUser(user.username);
    let dogs = null;

    if(Array.isArray(user.dogsOwned)){
        dogs = user.dogsOwned;
    }
    else{
        user.dogsOwned = [];
        dogs = user.dogsOwned;
    }

    if(dogs.indexOf(req.params.id) !== -1){
        return res.status(400).send("Dog with ID " + req.params.id + " already added to user!");
    }

    dogs.push(req.params.id);
    user.save(function(err){
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).send("Successfully added dog with ID: " + req.params.id);
    });

});

router.patch("/dogs/remove/:id", async function(req, res){
    if(!req.session || !req.session.user){
        return res.status(400).send("No User in Session!");
    }

    let user = req.session.user;
    user = await getUser(user.username);
    let dogs = null;

    if(Array.isArray(user.dogsOwned)){
        dogs = user.dogsOwned;
    }
    else{
        user.dogsOwned = [];
        dogs = user.dogsOwned;
    }

    if(dogs.indexOf(req.params.id) === -1){
        return res.status(400).send("Dog with ID " + req.params.id + " not assigned to user!");
    }

    dogs.splice(dogs.indexOf(req.params.id), 1);
    user.save(function(err){
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).send("Successfully removed dog with ID: " + req.params.id);
    });

});

module.exports = router;