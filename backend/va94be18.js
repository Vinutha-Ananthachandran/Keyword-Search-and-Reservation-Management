const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*'
}));

app.get('/bizsearch',(req,res) => {
  let term = req.query.keyword;
  let loc = req.query.location;
  let cat = req.query.category;
  let rad = req.query.distance;
  if(loc == ''){
    lat = req.query.lat;
    long = req.query.long;
    callToYelpApi(term,lat,long,cat,rad,res);
  }else{
    getGeocodeData(loc,term,cat,rad,res);
  }
});

app.get('/bizdetail',(req,res) => {
  let biz_id = req.query.id;
  let url = 'https://api.yelp.com/v3/businesses/'+biz_id

  let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
  let authToken = 'Bearer '+yelpKey;
  const getBizResult = async() =>{
    try{
      return await axios.get(url,{
        headers:{
          'Authorization': authToken
        }
      }
    );
    }catch(error){
      console.error(error);
    }
  }
  const bizData = async() =>{
    const bres = await getBizResult();
    if(bres.status == 200){
      nextCallReview(biz_id,bres.data,res);
    }
  }
  bizData();
});

function nextCallReview(biz_id,obj1,res){
  let revUrl = 'https://api.yelp.com/v3/businesses/'+biz_id+'/reviews';

  let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
  let authToken = 'Bearer '+yelpKey;
  const getYelpReview = async() =>{
    try{
      return await axios.get(revUrl,{
        headers:{
          'Authorization': authToken
        }
      }
    );
    }catch(error){
      console.error(error);
    }
  }
  const yelpRevData = async() =>{
    const revres = await getYelpReview();
    if (revres.status == 200){
      let newObj = Object.assign(obj1,{reviews: revres.data.reviews})
      res.send(newObj);
    }
  }
  yelpRevData();
}

function getGeocodeData(loc,term,cat,rad,res){
  let location = encodeURIComponent(loc);
  let url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyASbUA5whItqPIrzjqJfXN50OdOr8KZmlk';

  const getGoogleApi = async() =>{
    try{
      return await axios.get(url);
    }catch(error){
      console.error(error);
    }
  }

  const googleData = async() =>{
    const gres = await getGoogleApi();
    if(gres.status == 200){
      callToYelpApi(term,gres.data.results[0].geometry.location.lat,gres.data.results[0].geometry.location.lng,cat,rad,res);
    }
  }
  googleData();
}

function callToYelpApi(term,lat,long,cat,rad,res){
    let limit = 10;
    let url = 'https://api.yelp.com/v3/businesses/search?term='+term+'&latitude='+lat+'&longitude='+long+'&categories='+cat+'&radius='+rad+'&limit='+limit;

    let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
    let authToken = 'Bearer '+yelpKey;
    const getYelpResult = async() =>{
      try{
        return await axios.get(url,{
          headers:{
            'Authorization': authToken
          }
        }
      );
      }catch(error){
        console.error(error);
      }
    }
    const yelpData = async() =>{
      const result = await getYelpResult();
      if (result.status == 200){
        res.send(result.data.businesses);
      }
    }
    yelpData();
}

app.get('/autocomplete',(req,res) => {
  let term = req.query.term;
  let url = 'https://api.yelp.com/v3/autocomplete?text='+term;

  let yelpKey = 'CybJp4vrG19COqSorVyriOa_ikx4NVUZ84XToSPjMWZ99Sr8fXzHe-qZ2GveMcwjPkVyaiZaacdEF4kwUx8an_569M-4YxJYiUcf1gb1eynOOPv8upuocMFsEy8_Y3Yx';
  let authToken = 'Bearer '+yelpKey;
  const getYelpAutocomplete = async() =>{
    try{
      return await axios.get(url,{
        headers:{
          'Authorization': authToken
        }
      }
    );
    }catch(error){
      console.error(error);
    }
  }
  const yelpAutoData = async() =>{
    const rest = await getYelpAutocomplete();
    if (rest.status == 200){
      res.send(rest.data);
    }
  }
  yelpAutoData();
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
