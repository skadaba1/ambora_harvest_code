import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cross_decomposition import CCA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import rbf_kernel
from sklearn.decomposition import KernelPCA
from sklearn.preprocessing import StandardScaler
from scipy.stats import pearsonr
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools.tools import add_constant

from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.cross_decomposition import PLSRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.inspection import permutation_importance
from sklearn.tree import export_text


class Sherlock():
    
    def __init__(self):
        self.sorting_hat = SortingHat()
    
    def log(self, X, y, feature_names, cls=None):
        pearson = self.spa_pearson(X, y, feature_names)
        quadratic = self.spa_quadratic(X, y, feature_names)
        maximal = self.spa_maximal_corr(X, y, feature_names)
        multicollinearity = self.spa_multicollinearity(X, feature_names)
        decision = self.decision_tree(pearson, quadratic, maximal, multicollinearity, feature_names) if cls is None else cls
        self.sorting_hat.run_model(decision, X, y, feature_names)
    
    def spa_multicollinearity(self, X, feature_names):
        X = add_constant(X)

        # Compute VIF for each feature
        vif = dict()
        for indx, feature in enumerate(feature_names):
            vif[feature] = variance_inflation_factor(X, indx)

        return vif
    
    def spa_pearson(self, X, y, feature_names):
        """Computes the Pearson correlation coefficient for each feature with the response y."""
        correlations = {}
        for i, feature_name in enumerate(feature_names):
            corr, _ = pearsonr(X[:, i], y)
            correlations[feature_name] = corr
        return correlations

    def spa_quadratic(self, X, y, feature_names):
        """Computes the quadratic correlation (R-squared) for each feature with the response y."""
        correlations = {}
        for i, feature_name in enumerate(feature_names):
            corr = np.corrcoef(X[:, i], y.flatten())**2
            correlations[feature_name] = corr[0, 1]
        return correlations
    
    def spa_maximal_corr(self, X, y, feature_names, kernel="rbf", gamma=0.1):
        """
        Computes an approximation of the maximal correlation using Kernel CCA with non-linear kernels.
        """
        correlations = {}

        # Standardize the features and the response
        X = StandardScaler().fit_transform(X)
        y = StandardScaler().fit_transform(y.reshape(-1, 1))

        # Use Kernel PCA to map features to a higher-dimensional space
        for i, feature_name in enumerate(feature_names):
            X_feature = X[:, i].reshape(-1, 1)

            if kernel == "rbf":
                # Apply the RBF kernel
                X_feature_kpca = KernelPCA(kernel="rbf", gamma=gamma, n_components=1).fit_transform(X_feature)
                y_kpca = KernelPCA(kernel="rbf", gamma=gamma, n_components=1).fit_transform(y)
            else:
                raise ValueError(f"Kernel '{kernel}' is not implemented. Use 'rbf'.")

            # Perform CCA in the transformed space
            cca = CCA(n_components=1)
            cca.fit(X_feature_kpca, y_kpca)
            X_c, y_c = cca.transform(X_feature_kpca, y_kpca)

            # Compute the correlation in the canonical space
            corr = np.corrcoef(X_c.T, y_c.T)[0, 1]
            correlations[feature_name] = corr

        return correlations 
    
    def decision_tree(self, pearson, quadratic, maximal, multicollinearity, features, linearity_threshold = 0.1, multicollinearity_threshold = 5.00, interpretable=False):
        
        is_multicollinear = False
        is_nonlinear = False
        is_dynamic = False
        
        for indx, feature in enumerate(features):
            if(multicollinearity[feature] > multicollinearity_threshold):
                is_mutlicollienar=True
            if(quadratic[feature] - abs(pearson[feature]) > linearity_threshold or maximal[feature] - abs(pearson[feature]) > linearity_threshold):
                is_nonlinear=True
                
        if(is_multicollinear and is_nonlinear):
            return 'rf' if interpretable else 'svr'
        elif(is_multicollinear): # implies multicollinear only
            return 'pls'
        elif(is_nonlinear): # implies nonlinear but not multicollinear
            return 'dt' if interpretable else 'pr'
        else:
            return 'lr'
        
    
        
class SortingHat():
    
    def __init__(self):
        self.scaler = StandardScaler()
        
    def run_model(self, cls, X, y, feature_names):
        selected_model = self.assign_to_model(cls)
        fit_results = selected_model(X, y, feature_names)
        print(cls, fit_results['feature_importance'], fit_results['accuracy'])
        if(cls == 'dt'):
            tree_text = fit_results['tree_text']
            print(tree_text)
        elif(cls == 'rf'):
            tree_texts = fit_results['tree_text']
            for tree in tree_texts:
                print(tree)
    def assign_to_model(self, cls):
        if cls == 'rf':
            return self.rf
        elif cls == 'svr':
            return self.svr
        elif cls == 'pls':
            return self.pls
        elif cls == 'dt':
            return self.dt
        elif cls == 'pr':
            return self.pr
        else:
            return self.lr
    
    def normalize(self, X):
        return self.scaler.fit_transform(X)
    
    # random forest regression
    def rf(self, X, y, feature_names):
        X_normalized = self.normalize(X)
        model = RandomForestRegressor()
        model.fit(X_normalized, y)
        importance = model.feature_importances_
        importance_dict = dict(zip(feature_names, importance))
        accuracy = model.score(X_normalized, y)
        tree_texts = [export_text(tree, feature_names=feature_names) for tree in model.estimators_]
        
        return {'feature_importance': importance_dict, 'accuracy': accuracy, 'model': model, 'tree_text': tree_texts}
    
    # support vector regression
    def svr(self, X, y, feature_names, kernel='linear'):
        X_normalized = self.normalize(X)
        model = SVR(kernel=kernel)
        model.fit(X_normalized, y)
        
        # Calculate permutation importance
        result = permutation_importance(model, X_normalized, y, n_repeats=30, random_state=0)
        importance = result.importances_mean
        importance_dict = dict(zip(feature_names, importance))
        accuracy = model.score(X_normalized, y)
        
        return {'feature_importance': importance_dict, 'accuracy': accuracy}
    
    # partial least squares
    def pls(self, X, y, feature_names):
        X_normalized = self.normalize(X)
        model = PLSRegression(n_components=2)
        model.fit(X_normalized, y)
        importance = np.abs(model.x_weights_[:, 0])
        importance_dict = dict(zip(feature_names, importance))
        accuracy = model.score(X_normalized, y)
        return {'feature_importance': importance_dict, 'accuracy': accuracy}
    
    # decision tree
    def dt(self, X, y, feature_names):
        X_normalized = self.normalize(X)
        model = DecisionTreeRegressor()
        model.fit(X_normalized, y)
        importance = model.feature_importances_
        importance_dict = dict(zip(feature_names, importance))
        accuracy = model.score(X_normalized, y)
        tree_text = export_text(model, feature_names=feature_names)
        return {'feature_importance': importance_dict, 'accuracy': accuracy, 'model': model, 'tree_text':tree_text}
    
    # polynomial regression
    def pr(self, X, y, feature_names, degree=2):
        X_normalized = self.normalize(X)
        poly = PolynomialFeatures(degree)
        X_poly = poly.fit_transform(X_normalized)
        model = LinearRegression()
        model.fit(X_poly, y)
        importance = np.abs(model.coef_)/np.sum(np.abs(model.coef_))
        importance_dict = dict(zip(poly.get_feature_names_out(feature_names), importance))
        accuracy = model.score(X_poly, y)
        return {'feature_importance': importance_dict, 'accuracy': accuracy}
    
    # linear regression
    def lr(self, X, y, feature_names):
        X_normalized = self.normalize(X)
        model = LinearRegression()
        model.fit(X_normalized, y)
        importance = np.abs(model.coef_)/np.sum(np.abs(model.coef_))
        importance_dict = dict(zip(feature_names, importance))
        accuracy = model.score(X_normalized, y)
        return {'feature_importance': importance_dict, 'accuracy': accuracy}