const express = require("express");
const router = express.Router();
const Joi = require("joi");

const Message = require("../models/message");

router.get("/", function (req, res, next) {
  Message.findAll().then((result) => {
    res.send(result);
  });
});

router.get("/:ts", function (req, res, next) {
  let ts = req.params.ts;
  Message.findAll({where: {ts: ts}}).then((result) => {
    if (result.length === 0) {
      return res
        .status(404)
        .send("The message with the given ts was not found");
    }
    res.send(result);
  });
});

router.post("/", function (req, res, next) {
  const mensaje = req.body;
  const { error } = validateMessage(mensaje);

  if (error) {
    return res.status(404).send(error.details[0].message);
  }

  // agregar a la db
  const { message, author, ts } = req.body;
  Message.create({ message: message, author: author, ts: ts }).then(
    (result) => {
      res.send(result);
    }
  );
});

router.put("/:ts", function (req, res, next) {
  //mensaje existe?
  let ts = req.params.ts;

  //body correcto?
  const mensaje = req.body;
  const { error } = validateMessage(mensaje);

  if (error) {
    return res.status(404).send(error.details[0].message);
  }

  //actualizo db
  Message.update(mensaje, { where: { ts: ts } }).then((result) => {
    if(result[0] == 0){
        return res.status(404).send("The message with the given ts was not found");
    }
    res.status(200).send("The message was updated succesfully");
  });
});


router.delete("/:ts", function (req, res, next) {
    let ts = req.params.ts;
    Message.destroy({where: {ts:ts}}).then(result => {
        if(result === 0){
            return res.status(404).send("The message with the given ts was not found");
        }
        res.status(204).send();
    });
});

const validateMessage = (mensaje) => {
  const schema = Joi.object({
    message: Joi.string().alphanum().required().min(5),
    author: Joi.string().required().pattern(new RegExp("[a-zA-Z] [a-zA-Z]")),
    ts: Joi.string().required(),
  });

  return schema.validate(mensaje);
};

module.exports = router;
