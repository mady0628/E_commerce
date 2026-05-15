import {useState,useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import { apiFetch } from '../utils/api';

function Product(){
    const [name,setname] = useState('');
    const [cost,setcost] = useState(0);
    const [des,setdes] = useState('');
    const navigate = useNavigate();

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if (!token){
            navigate('/sign_in');
         return;
        }
    },[])

    const addProduct = async()=>{
        const token = localStorage.getItem('token');
        const data = await apiFetch('/api/product',{
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                cost: Number(cost),
                describe: des,
            })
        })
        if (data.product){
            alert("add product success");
        } else {
            alert(data.error || data.message || "fail to add");
        }
    }
    return (
        <div>
            <h1>Add product</h1>
            <br></br>
            <input 
            placeholder='Name'
            onChange={(p)=> setname(p.target.value)}>
            </input>
            <br></br>
            <input 
            type="number"
            placeholder='Cost'
            min="0"
            onChange={(p)=> setcost(p.target.value)}
            >
            </input>
            <br></br>
            <input 
            placeholder='des'
            onChange={(p)=> setdes(p.target.value)}>
            </input>
            <br></br>
            <button onClick={()=>addProduct()}>Create Product</button>
        </div>
    )
}

export default Product;
