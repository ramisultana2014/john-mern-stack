import { Logo, FormRow } from "../components";
import Wrapper from "../assets/wrappers/RegisterAndLoginPage";
import { useNavigate } from "react-router-dom";
import { Form, redirect, useNavigation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
//this action function we import it in App.jsx and use it in  <Login />,
export const action = async ({ request }) => {
  //formdata is just js api to collect inputs in the Form and we do it by {request} then tow lines below
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  // console.log(data); {name: 'john', lastName: 'smith', location: 'earth', email: 'john@gmail.com', password: 'secret123'}
  try {
    //we must return something in try and catch
    await customFetch.post("/auth/login", data);
    // we write it  like /auth/login because what we do in proxy( no need to write http://localhost:5100) and customFetch.js no need to write /api/v1 and customFetch
    toast.success("login successful");
    return redirect("/dashboard");
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    //console.log(error);
    return error;
  }
};
function Login() {
  const navigate = useNavigate();
  const loginDemoUser = async () => {
    const data = {
      email: "test@test.com",
      password: "secret123",
    };
    try {
      await customFetch.post("/auth/login", data);
      toast.success("take a test drive");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };
  const navigation = useNavigation();
  // we use it with button submit
  const isSubmitting = navigation.state === "submitting";
  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo />
        <h4>Login</h4>
        <FormRow type="email" name="email" defaultValue="john@gmail.com" />
        <FormRow type="password" name="password" defaultValue="secret123" />
        <button type="submit" className="btn btn-block" disabled={isSubmitting}>
          {isSubmitting ? "submitting..." : "submit"}
        </button>
        <button onClick={loginDemoUser} type="button" className="btn btn-block">
          explore the app
        </button>
        <p>
          Not a member yet?
          <Link to="/register" className="member-btn">
            Register
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
}

export default Login;
