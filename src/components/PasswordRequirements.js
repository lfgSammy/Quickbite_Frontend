import { CheckCircleIcon } from './icons';

export const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
];

export default function PasswordRequirements({ password }) {
  return (
    <ul className="mt-1 flex flex-col gap-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 text-caption transition-colors ${
              met ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}
