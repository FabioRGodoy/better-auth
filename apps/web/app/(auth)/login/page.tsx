export default function LoginPage() {
  const handleLogin = async (formData: FormData) => {
    "use server";
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Email:", email, "Password:", password);
    // Handle login logic here
  };

  return (
    <main>
      <section className="w-full min-h-screen flex flex-col items-center justify-center p-8">
        Login Page
        <form
          action={handleLogin}
          className="max-w-8/12 flex flex-col gap-4 border p-4 rounded-lg"
        >
          <input type="email" name="email" placeholder="Email" />
          <input type="password" name="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}
