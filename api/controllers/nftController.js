'use strict';

var mongoose = require('mongoose')
var NFT = mongoose.model('nft');
var getDateName = require('../getDateName')

const fs = require('fs')

require('dotenv').config();

delete process.env['http_proxy'];
delete process.env['HTTP_PROXY'];
delete process.env['https_proxy'];
delete process.env['HTTPS_PROXY'];

exports.createNft = async function(req, res) {
	let fileName = req.body.title + '_' + getDateName() + '.jpeg'
	let filePath = process.env.PWD + '/files/' + fileName

	let imageFile = req.files.file;
	await imageFile.mv(filePath, async (err) => {
		if (err) {
			console.log('Error: failed to download file')
			return res.status(500).send(err);
		}

		req.body.img = {
			data: fs.readFileSync(filePath),
			contentType: 'image/jpeg'
		}
		var nftTemp = new NFT(req.body)
		nftTemp.save(function(err, nft) {
			if(err)
				res.send(err)
			res.json(nft)
		})
	});

}

exports.getNfts = async function(req, res) {
	let params = req.params.nftId
	let query  = req.query
	if(params != undefined)
		query['nft_id'] = params
	if(query.maxPrice !== undefined && query.minPrice !== undefined)
		query['price'] = {$lte: query.maxPrice, $gte: query.minPrice}
	
	if(query.saleMethod != undefined)
		query['saleMethod'] = {$in: query.saleMethod.split(',').map(function(item) {
			return parseInt(item, 10)
		})}
	
	if(query.collect != undefined)
		query['collect'] = {$in: query.collect.split(',').map(function(item) {
			return parseInt(item, 10)
		})}
	
	if(query.chainId != undefined)
		query['chainId'] = {$in: query.chainId.split(',').map(function(item) {
			return parseInt(item, 10)
		})}

	NFT.find(
		query,
		function(err, nfts) {
			if (err)
				res.send(err);
			res.json(nfts);
		}
	)
}

exports.updateNft = async function(req, res) {
	NFT.findOneAndUpdate(
        {nft_id: req.params.nftId}, 
        req.body,
        {new: true},
        function(err, user) {
            if (err)
              res.send(err);
            res.json(user);
        }
    )
}