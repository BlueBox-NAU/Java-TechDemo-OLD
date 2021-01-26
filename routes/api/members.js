const express = require('express');
const uuid = require('uuid');
const router = express.Router();
const members = require('../../Members');

// Gets members of server
router.get('/', (req, res) => res.json(members));

// Get member from id using '<host url>/api/members/<id #>' in the url
router.get('/:id', (req, res) => {
    const found = members.some(member => member.id === parseInt(req.params.id));

    if(found) {
        res.json(members.filter(member => member.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `Member with id=${req.params.id} not found` });
    }
});

// Create Member
router.post('/create', (req, res) => {
    const newMember = {
        id: uuid.v4(),
        password: req.body.password,
        email: req.body.email
    }

    if(!newMember.password || !newMember.email) {
        //res.redirect('/register');
        return res.status(400).json({ msg: 'Include password and email' });
    }

    members.push(newMember);
    //res.json(members);
    res.redirect('/demon2');
});

// Update Member
router.put('/:id', (req, res) => {
    const found = members.some(member => member.id === parseInt(req.params.id));

    if(found) {
        const updMember = req.body;
        members.forEach(member => {
            if(member.id === parseInt(req.params.id)) {
                member.password = updMember.password ? updMember.password : member.password;
                member.email = updMember.email ? updMember.email : member.email;

                res.json({ msg: 'Member was updated', member});
            }
        });
    } else {
        res.status(400).json({ msg: `Member with id=${req.params.id} not found` });
    }
});

// Delete Member
router.delete('/:id', (req, res) => {
    const found = members.some(member => member.id === parseInt(req.params.id));

    if(found) {
        res.json({
            msg: 'Member deleted',
            members: members.filter(member => member.id !== parseInt(req.params.id))
        });
    } else {
        res.status(400).json({ msg: `Member with id=${req.params.id} not found` });
    }
});

module.exports = router;