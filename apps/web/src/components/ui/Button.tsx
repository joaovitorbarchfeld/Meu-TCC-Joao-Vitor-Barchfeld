interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button = ({ children, variant = 'primary', loading, ...props }: ButtonProps) => {
  const styles = {
    primary: {
      background: loading ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      color: '#ffffff'
    },
    secondary: {
      background: 'rgba(0, 0, 0, 0.48)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.12)'
    }
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        height: '44px',
        padding: '0 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: '600',
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        fontSize: '1rem',
        opacity: loading || props.disabled ? 0.5 : 1,
        ...styles[variant],
        ...props.style
      }}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
};