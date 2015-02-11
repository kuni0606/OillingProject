#include <iostream>
#include <fstream>
using namespace std;

class Table{

public:
	bool feasible(int r ,int g, int b);		//r, g, b 개수를 전달 받아 테이블을 꾸미기에 알맞은 개수의 풍선이 있는지 확인한 후 true/false중 하나를 return한다.
	int select(int &r, int &g, int &b);		//feasible() 함수를 통해 개수가 적당하다면 당장의 개수를 보고 테이블을 꾸민다.
};