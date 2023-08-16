const router = require('express').Router()
const Reg = require('../models/reg')
const Banner=require('../models/banner')
const Service=require('../models/service')
const Testi=require('../models/testi')
const Query=require('../models/query')
const multer=require('multer')
const nodemailer=require('nodemailer')

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

router.get('/', (req, res) => {
    res.render('admin/login.ejs')
})

router.post('/', async (req, res) => {
    // console.log(req.body)
    const { uname, password } = req.body
    const usercheck = await Reg.findOne({ username: uname })
    // console.log(usercheck)
    if (usercheck !== null) {
        if(usercheck.password!==password){
        res.redirect('/admin/dashboard')
        }else{
            res.redirect('/admin/')
        }
    }else{
        res.redirect('/admin/')
    }

})

router.get('/dashboard',(req,res)=>{
    res.render('admin/dashboard.ejs')
})

router.get('/banner',async(req,res)=>{
    const record=await Banner.findOne()
    res.render('admin/banner.ejs',{record})
})

router.get('/bannerupdate/:id',async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Banner.findById(id)
    res.render('admin/bannerform.ejs',{record})
})
router.post('/bannerupdate/:id',upload.single('img'),async(req,res)=>{
    //console.log(req.file)
    //console.log(req.body)
     //console.log(req.params.id)
     const{title,desc,ldesc}=req.body
     const id=req.params.id
     if(req.file){
        const filename=req.file.filename
     await Banner.findByIdAndUpdate(id,{title:title, desc:desc,ldesc:ldesc,img:filename})
     }else{
        await Banner.findByIdAndUpdate(id,{title:title, desc:desc,ldesc:ldesc})

     }
     res.redirect('/admin/banner')
})
router.get('/service',async(req,res)=>{
    const record=await Service.find().sort({postedDate:-1})
    const totalService=await Service.count()
    const publishCount=await Service.count({status:'publish'})
    const unpublishCount=await Service.count({status:'unpublish'})
    //console.log(unpublishcount)
    res.render('admin/service.ejs',{record,totalService,publishCount,unpublishCount})
})
router.get('/serviceadd',(req,res)=>{
    res.render('admin/serviceform.ejs')
})
router.post('/serviceadd',upload.single('img'),(req,res)=>{
   //console.log (req.body)
    //console.log(req.file)
    const filename=req.file.filename
   const {sname,sdesc,sldesc}=req.body
   let currentDateTime=Date()
  const record= new Service({name:sname, desc:sdesc,ldesc:sldesc,postedDate: currentDateTime,img:filename})
  record.save()
           // console.log(record)
res.redirect('/admin/service')
})

router.get('/servicedelete/:id',async(req,res)=>{
  // console.log(req.params.id)
  const id=req.params.id
  await Service.findByIdAndDelete(id)
  res.redirect('/admin/service')
})

router.get('/servicestatusupdate/:id',async(req,res)=>{
   // console.log(req.params.id)
   const id=req.params.id
  const record= await Service.findById(id)
  //console.log(record)
  let currentstatus=null
  if(record.status=='unpublish'){
    currentstatus='publish'
  }else{
    currentstatus='unpublish'
  }
  await Service.findByIdAndUpdate(id,{status:currentstatus})
  res.redirect('/admin/service')
})

router.get('/testi',async(req,res)=>{
    const record=await Testi.find()
    // console.log(record)
    const totalReview=await Testi.count()
    const publishCount=await Testi.count({status:'publish'})
    const unpublishCount=await Testi.count({status:'unpublish'})
        //console.log(unpublishCount)

    res.render('admin/testi.ejs',{record,totalReview,publishCount,unpublishCount})
})

router.get('/testistatusupdate/:id',async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record= await Testi.findById(id)
    //console.log(record)
    let newstatus=null
    if(record.status=='unpublish'){
        newstatus='publish'
    }
    else{
        newstatus='unpublish'
    }
    await Testi.findByIdAndUpdate(id,{status:newstatus})
    res.redirect('/admin/testi')
})

router.get('/query',async(req,res)=>{
    const record=await Query.find()
    res.render('admin/query.ejs',{record})
})
router.get('/reply/:id',async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Query.findById(id)
    //console.log(record)
    res.render('admin/replyform.ejs',{record})
})

router.post('/reply/:id',async(req,res)=>{
    //console.log(req.params.id)
    //console.log(req.body)
    const id=req.params.id
    const{to,from,sub,body}=req.body
    let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth:{
      user: 'gokushubh82@gmail.com', // generated ethereal user
      pass: 'htkahejvkuevstrp', // generated ethereal password
    },
  });
  console.log('connected to gmail smtp server')
  let info = await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: sub, // Subject line
    text: body, // plain text body
    //html: "<b>Hello world?</b>", // html body
  });
  console.log('email sent')
  await Query.findByIdAndUpdate(id,{status:'Replied'})
  res.redirect('/admin/query')
})

module.exports = router