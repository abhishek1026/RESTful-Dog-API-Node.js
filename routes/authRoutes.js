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
            return res.status(200).json(user);
        }
    
        return res.status(401).send("UNAUTHORIZED ACCESS: Incorrect password for username " + req.body.username + "!!!");
    
    } catch (error) {
        return res.status(500).send(error.message);
    }

});

router.delete("/logout", async (req, res) => {

    try {
        if(!req.session || !req.session.user){
            throw new Error("No User in Session!");
        }
        const user = req.session.user;
        req.session.reset();
        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).send(error.message);
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

    dogs.forEach(function(dogId, i){
        Dog.findById(dogId, function (err, dog) {
            if (!err && dog) {
                result.push(dog);
            }
            if(i + 1 == dogs.length){
                setTimeout(function(){
                    return res.status(200).json(result);
                }, 200);
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