#include <iostream>
#include <fstream>
using namespace std;

class Table{

public:
	bool feasible(int r ,int g, int b);		//r, g, b ������ ���� �޾� ���̺��� �ٹ̱⿡ �˸��� ������ ǳ���� �ִ��� Ȯ���� �� true/false�� �ϳ��� return�Ѵ�.
	int select(int &r, int &g, int &b);		//feasible() �Լ��� ���� ������ �����ϴٸ� ������ ������ ���� ���̺��� �ٹδ�.
};