const EmptyState = ({ icon, title, description, action, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="text-dark-400 mb-4">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-xl font-semibold text-dark-100 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-dark-400 max-w-md mb-6">{description}</p>
      )}
      {action && onAction && (
        <button onClick={onAction} className="btn-primary">
          {action}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
