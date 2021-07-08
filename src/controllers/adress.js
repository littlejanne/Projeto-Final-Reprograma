const Adress = require('../models/adress');
const mongoose = require('mongoose');

// posso padronizar os erros

const getAll = async (req, res) => {
    let adress = [];
    try {
        adress = await Adress.find().populate('host');
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
         const estado =  req.query.estado || ""; 
        let addressQuery = adress.filter(endereco => endereco.state.toLowerCase()==estado.toLowerCase())
        if (addressQuery.length == 0) 
        return res.status(200).json(adress)
        else
        return res.status(200).json(addressQuery)
}



const adressRegisted = async (req, res) => {
    const ordem = req.query.ordem;
    try {
        const adress = await Adress.find({}, { state : true, city: true })
        let ordem;
        const filter = (a, b) => ordem == 'desc' ? b - a : a - b;
        const adressMap = Array.from(new Set(adress.map(data => data.state))).sort(filter)
        const city = Array.from(new Set(adress.map(data => ({ city: data.city, state: data.state })))).sort(filter)
        const states = {};
        adressMap.forEach(state => states[state] = []);
        
        city.forEach(({ state, city }) => {
        
            if (states[state].includes(city) == false) {
                states[state].push(city);
            }
        })
        res.status(200).json(states)
    }
    catch (error) {
        res.status(500).json({ message: error.message})
    }
}


const showById = async (req, res) => {
    try {
        const adress = await Adress.findById(req.params.id).populate('host')
        if (adress == null) {
            return res.status(400).json({ message: "Descupa, mas não foi possivel encontrar!"});
        }
        return res.status(200).json(adress)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
const create = async (req, res) => {
    const newAdress = new Adress({
        _id: new mongoose.Types.ObjectId(),
        ...req.register.adress
    })
    try {

        const adress = await newAdress.save();
        return res.status(201).json({ message: 'Salvo com sucesso!', data : adress })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteById = async (req, res) => {
    const adress = req.modelAdress;

    try {
        let deletedAdress = await adress.delete();
        return res.status(200).json({ message: 'deletado com sucesso', data : deletedAdress })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const replaceById = async (req, res) => {

    try {
        let replaceAdress = await Adress.replaceOne({ _id: req.params.id }, req.register.adress);
        if (replaceAdress.nModified == 0) {
            throw Error('Descupa ocorreu um erro.')
        }
        return res.status(200).json({ message : "Substituido com sucesso!", data : req.modelAdress })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const updateById = async (req, res) => {

    try {
        let updateAdress = await Adress.updateOne({ _id: req.params.id }, req.register.adress);
        if (updateAdress.ok == 0) {
            throw Error('Descupa ocorreu um erro.')
        }
        else if (updateAdress.nModified==0) {
            return res.status(304).json({ message : "Nenhuma alteracao!"});
        }
        return res.status(200).json({ message : "Substituido com sucesso!", data : req.modelAdress })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}



module.exports = {
    getAll,
    create,
    deleteById,
    replaceById,
    updateById,
    showById,
    adressRegisted
}