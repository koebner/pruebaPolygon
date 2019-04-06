const express = require('express');
const ejs = require('ejs');
const Openpay =require('openpay');
var parser = require('body-parser');
const jwt  = require('jsonwebtoken');

var openpay = new Openpay('mke8rkapbmztlcvtjgbh', 'sk_10f3ae6227d44ce79f7572a6a80c9943');


//mostrando la instancia 
const app = express();

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
app.set('view engine', 'ejs');
app.get('/',(req,res) => res.render('index'));


//registrando usuarios con POST desde un formulario
app.post('/usuario',(req,res) =>{
    
    const persona = {
      first : req.body.fname,
      last : req.body.lname,
      mail : req.body.correo,
      phone : req.body.tel_per,
      ciudad : req.body.ciudad,
      estado : req.body.estado,
      direccion : req.body.direccion,
      postal : req.body.postal
  }
  // const token = jwt.sign({persona}, "my_secret_key");
  // console.log(token);
 
  //proceso de control 
  //console.log(persona);
  
  //variable untouched de openpay para enviar datos !!!
    var newCustomer = {
        "name": persona.first,
        "email":persona.mail,
        "last_name":persona.last,
        "address":{
          "city":persona.ciudad,
          "state":persona.estado,
          "line1":persona.direccion,
          "line2":"Sin acceso",
          "postal_code":persona.postal,
          "country_code":"MX"
        },
        "phone_number":persona.phone
      };
      //manejo de funcion de la api para enviar se puede usar el operador flecha*
      openpay.customers.create(newCustomer, function(error, body) {
        error;    // null if no error occurred (status code != 200||201||204)
        body;     // contains the object returned if no error occurred (status code == 200||201||204)
        //console.log(customers);
        console.log(error);
        if(error==null){
            //res.send('Todo bien');
            res.render('newUser.ejs', {
              data: req.body, // { message, email }
              
            })
        }
        
    });
    
    
    // const respuesta =openpay.customers.newCustomer(newCustomer, callback);
    // console.log(respuesta);

});


//se pide lista de usuario lo he puesto de manera manual a 20 se puede crear dinamico 
app.get('/userGet',asegurarRouter,(req,res)=>{

      
      
      jwt.verify(req.token, 'my_secret_key', (err, authData)=>{
        if (err) {
          error = 'Usuario no Admitido';     
          //res.sendStatus(403);
          res.render('noAuth.ejs',
           {error}
          );
        }else{

                //parametros para hacer la llamada
          var searchParams = {
            'creation[gte]' : '2013-11-01',
            'limit' : 20
          };
            //funcion a operar
            openpay.customers.list(searchParams, function(error, list) {
              console.log(list);
              //res.send(list);
              if (list!=null) {
                
                res.render('listado.ejs',
                  {list}
                  
                );
                
              } else {
                res.send('no hay nada ');
              }
            // res.render('listado.ejs', )

            });

        }

      }
      );

}
);

app.get('/login',(req,res)=>
{
res.render('login.ejs');
});

app.post('/login', (req, res) => {

          const logueo = {
            mail : req.body.mail,
            password : req.body.pass
                    }
          var busqueda = {
            'creation[gte]' : '2013-11-01',
            'limit' : 80
          };
            //funcion a operar
            openpay.customers.list(busqueda, function(error, list) {
              
              //res.send(list);
              if (list!=null) {
                
                encontrado = false;
                // res.render('listado.ejs',
                  for(var item of list) {
                    console.log('item: ', item.email);
                    if (item.email === logueo.mail) {

                      encontrado = true;
                      

                      
                    }
                    
                  }
                      if(encontrado) {
                        const token = jwt.sign({logueo}, "my_secret_key");
                      //res.setHeader('authorization',token);
                        res.redirect('/userGet?token='+token);
                        //estado = 'error al loguearte';
                        //res.redirect('noAuth.ejs');
                        //   {list}
                        // );
                      }else{
                        estado = 'error al loguearte';
                        res.redirect('/userGet?token='+estado);
                      }
                
              } else {
                res.send('no hay nada ');
              }
          

            });

        });
//formato del token
//=> authorization:bearer <token>

//JWT para bloquear acceso
function asegurarRouter(req,res,next) {
  
  const bearerHeader = req.query;

  console.log(bearerHeader);
  if (bearerHeader['token'] !== null) {
    //partir el token
    //const bearer = bearerHeader.split(' ');
    //const bearerToken = bearer[1];
    
    req.token = bearerHeader['token'];
    //ejecuta la siguiente funcion
    next();
  }else {
    respuesta = 'no hay token';
    next();
  }
  
}
app.listen(3000, () => console.log(`listening on http://localhost:3000`));

