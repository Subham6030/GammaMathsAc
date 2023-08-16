const router=require('express').Router()//module
const Banner=require('../models/banner')
const Service=require('../models/service')
const Testi=require('../models/testi')
const Query=require('../models/query')
 
const multer=require('multer')

let storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/upload')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+file.originalname)
    }
})
let upload=multer({
    storage:storage,
    limits:{files:1024*1024*4}
})


router.get('/',async(req,res)=>{
    const bannerRecord=await Banner.findOne()
    const serviceRecord=await Service.find({status:'publish'})
    // console.log(serviceRecord)
    const testiRecord=await Testi.find({status:'publish'})
    res.render('index.ejs',{bannerRecord,serviceRecord,testiRecord})
})

router.get('/banner',async(req,res)=>{
   const record= await Banner.findOne()
   //console.log(record)
    res.render('banner.ejs',{record})
})

router.get('/servicedetail/:id',async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Service.findById(id)
    res.render('servicedetails.ejs',{record})
})

router.get('/testi',(req,res)=>{
    res.render('testiform.ejs')
})

router.post('/testi',upload.single('img'),(req,res)=>{
    //console.log(req.body)
    //console.log(req.file)
    const{quotes,name}=req.body
    if(req.file){
        const filename=req.file.filename
    const record=new Testi({quotes:quotes,name:name,img:filename})
    record.save()
    }else{
        const record=new Testi({quotes:quotes,name:name,img:'noprofile.jpeg'})
        record.save()  
    }
    //console.log(record)

})

router.post('/',(req,res)=>{
    //console.log(req.body)
    const{email,query}=req.body
   const record=new Query({email:email,query:query})
   record.save()
   console.log(record)
})




module.exports=router