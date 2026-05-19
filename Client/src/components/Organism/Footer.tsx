export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-4 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <p className="text-gray-600 text-sm">
          © {currentYear} YourApp. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a 
            href="#" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
          >
            Privacy
          </a>
          <a 
            href="#" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
          >
            Terms
          </a>
          <a 
            href="#" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
