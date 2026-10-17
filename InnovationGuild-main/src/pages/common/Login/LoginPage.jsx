import LoginForm from './_components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen pt-navbar bg-light pb-8 sm:pb-10 lg:pb-12">
      <div className="container mx-auto">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
