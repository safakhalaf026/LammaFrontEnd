import {Routes,Route} from 'react-router'
import { useContext, useEffect, useState } from 'react';
import './app.css'
import NavBar from './components/NavBar/NavBar'
import SignUpForm from './components/SignUpForm/SignUpForm';
import SignInForm from './components/SignInForm/SignInForm';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import ServiceForm from './components/ServiceForm/ServiceForm';
import ServiceDetails from './components/ServiceDetails/ServiceDetails';
import * as serviceService from './services/serviceService'
import { UserContext } from './contexts/UserContext';

const App = () => {
  const {user} = useContext(UserContext)

  const [services, setServices]= useState([])
  const [serviceToUpdate, setServiceToUpdate]= useState(null)

  useEffect(()=>{
    const getAllServices = async()=>{
      try {
        const data = await serviceService.index()
        setServices(data)
      } catch (err) {
        console.log(err)
      }
    }
    getAllServices()
  },[])


  const updateService = (service) =>{
    setServices([...services,service])
  }

  const findServicesToUpdate = (serviceId)=>{
    const foundService = services.find(service=>service._id===serviceId)
    setServiceToUpdate(foundService)
  }
  
  const deleteService = (serviceId)=>{
    const newServiceList = services.filter(service=>service._id !==serviceId)
    setServices(newServiceList)
  }
  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <Landing />} />
        <Route path='/sign-up' element={<SignUpForm />} />
        <Route path='/sign-in' element={<SignInForm />} />
        <Route path='/service/new' element={<ServiceForm updateService={updateService} />} />
        <Route path='/service/:serviceId' element={<ServiceDetails deleteService={deleteService} findServicesToUpdate={findServicesToUpdate} />} />
        <Route path='/service/:serviceId/update' element={<ServiceForm  serviceToUpdate={serviceToUpdate} updateService={updateService} />} />
      </Routes>
    </>
  );
};

export default App;

