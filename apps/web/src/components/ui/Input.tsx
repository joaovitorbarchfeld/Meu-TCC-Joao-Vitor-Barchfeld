interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div>
      {label && (
        <label style={{ 
          display: 'block', 
          color: '#ffffff', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem' 
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          height: '44px',
          padding: '0 1rem',
          borderRadius: '0.75rem',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.48)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          outline: 'none',
          fontSize: '0.875rem',
          ...props.style
        }}
      />
    </div>
  );
};