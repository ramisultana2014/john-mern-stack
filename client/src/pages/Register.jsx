import { Logo, FormRow } from "../components";
import Wrapper from "../assets/wrappers/RegisterAndLoginPage";
import { Form, redirect, useNavigation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
//this action function we import it in App.jsx and use it in <Register/>
export const action = async ({ request }) => {
  //formdata is just js api to collect inputs in the Form and we do it by {request} then tow lines below
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  // console.log(data); {name: 'john', lastName: 'smith', location: 'earth', email: 'john@gmail.com', password: 'secret123'}
  try {
    //we must return something in try and catch
    await customFetch.post("/auth/register", data);
    // we write it  like /auth/register because what we do in proxy( no need to write http://localhost:5100) and customFetch.js no need to write /api/v1 and customFetch
    toast.success("Registration successful");
    return redirect("/login");
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    //console.log(error);
    return error;
  }
};
function Register() {
  const navigation = useNavigation();
  // we use it with button submit
  const isSubmitting = navigation.state === "submitting";
  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo />
        <h4>Register</h4>
        <FormRow type="text" name="name" defaultValue="john" />
        <FormRow
          type="text"
          name="lastName"
          labelText="last name"
          defaultValue="smith"
        />
        <FormRow type="text" name="location" defaultValue="earth" />
        <FormRow type="email" name="email" defaultValue="john@gmail.com" />

        <FormRow type="password" name="password" defaultValue="secret123" />

        <button type="submit" className="btn btn-block" disabled={isSubmitting}>
          submit
        </button>
        <p>
          Already a member?
          <Link to="/login" className="member-btn">
            Login
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
}

export default Register;
